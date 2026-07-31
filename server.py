#!/usr/bin/env python3
"""Early-access signup API for Javen (AI Vlog Director)."""

from __future__ import annotations

import csv
import os
import re
import sqlite3
from contextlib import asynccontextmanager, contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterator, List, Optional, Tuple

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

ROOT = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("WAITLIST_DATA_DIR", str(ROOT / "data")))
DB_PATH = DATA_DIR / "waitlist.db"
CSV_PATH = DATA_DIR / "waitlist.csv"
DATABASE_URL = (os.environ.get("DATABASE_URL") or "").strip()

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class WaitlistEntry(BaseModel):
    email: EmailStr
    name: str = Field(default="", max_length=120)
    role: str = Field(default="", max_length=64)
    locale: str = Field(default="zh", max_length=8)
    source: str = Field(default="", max_length=512)
    user_agent: str = Field(default="", max_length=512)


def storage_backend() -> str:
    return "postgres" if DATABASE_URL else "sqlite"


def _normalize_database_url(url: str) -> str:
    # Render sometimes provides postgres:// — psycopg2 accepts it.
    return url


@contextmanager
def db_conn() -> Iterator[Any]:
    if DATABASE_URL:
        import psycopg2

        conn = psycopg2.connect(_normalize_database_url(DATABASE_URL), sslmode="require")
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
    else:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        finally:
            conn.close()


def _execute(conn: Any, sql: str, params: Tuple[Any, ...] = ()) -> Any:
    if storage_backend() == "postgres":
        sql = sql.replace("?", "%s")
        cur = conn.cursor()
        cur.execute(sql, params)
        return cur
    cur = conn.execute(sql, params)
    return cur


def init_db() -> None:
    with db_conn() as conn:
        if storage_backend() == "postgres":
            _execute(
                conn,
                """
                CREATE TABLE IF NOT EXISTS waitlist (
                    id SERIAL PRIMARY KEY,
                    email TEXT NOT NULL UNIQUE,
                    name TEXT DEFAULT '',
                    role TEXT DEFAULT '',
                    locale TEXT DEFAULT 'zh',
                    source TEXT DEFAULT '',
                    user_agent TEXT DEFAULT '',
                    created_at TEXT NOT NULL
                )
                """,
            )
        else:
            _execute(
                conn,
                """
                CREATE TABLE IF NOT EXISTS waitlist (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                    name TEXT DEFAULT '',
                    role TEXT DEFAULT '',
                    locale TEXT DEFAULT 'zh',
                    source TEXT DEFAULT '',
                    user_agent TEXT DEFAULT '',
                    created_at TEXT NOT NULL
                )
                """,
            )


def find_email(conn: Any, email: str) -> Optional[str]:
    if storage_backend() == "postgres":
        cur = _execute(
            conn,
            "SELECT email FROM waitlist WHERE LOWER(email) = LOWER(?)",
            (email,),
        )
        row = cur.fetchone()
        return row[0] if row else None
    cur = _execute(
        conn,
        "SELECT email FROM waitlist WHERE email = ? COLLATE NOCASE",
        (email,),
    )
    row = cur.fetchone()
    return row["email"] if row else None


def insert_signup(
    conn: Any,
    *,
    email: str,
    name: str,
    role: str,
    locale: str,
    source: str,
    user_agent: str,
    created_at: str,
) -> None:
    _execute(
        conn,
        """
        INSERT INTO waitlist (email, name, role, locale, source, user_agent, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (email, name, role, locale, source, user_agent, created_at),
    )


def count_signups(conn: Any) -> int:
    cur = _execute(conn, "SELECT COUNT(*) FROM waitlist")
    row = cur.fetchone()
    return int(row[0])


def list_signups(conn: Any) -> List[Dict[str, Any]]:
    cur = _execute(
        conn,
        """
        SELECT email, name, role, locale, source, user_agent, created_at
        FROM waitlist
        ORDER BY created_at ASC
        """,
    )
    rows = cur.fetchall()
    if storage_backend() == "postgres":
        cols = ["email", "name", "role", "locale", "source", "user_agent", "created_at"]
        return [dict(zip(cols, row)) for row in rows]
    return [dict(row) for row in rows]


def refresh_csv(conn: Any) -> None:
    """Local CSV mirror (useful for SQLite / local exports)."""
    if storage_backend() == "postgres":
        return
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    rows = list_signups(conn)
    with CSV_PATH.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["email", "name", "role", "locale", "source", "user_agent", "created_at"],
        )
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Javen Early Access", version="2.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@app.get("/api/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "javen-early-access",
        "storage": storage_backend(),
        "persistent": storage_backend() == "postgres",
    }


@app.post("/api/waitlist")
async def join_waitlist(entry: WaitlistEntry, request: Request) -> dict:
    email = str(entry.email).strip().lower()
    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=422, detail="Invalid email")

    created_at = utc_now()

    with db_conn() as conn:
        if find_email(conn, email):
            return {"ok": True, "already_registered": True, "email": email}

        insert_signup(
            conn,
            email=email,
            name=entry.name.strip(),
            role=entry.role.strip(),
            locale=entry.locale.strip() or "zh",
            source=entry.source.strip() or str(request.headers.get("referer", "")),
            user_agent=entry.user_agent.strip() or request.headers.get("user-agent", ""),
            created_at=created_at,
        )
        refresh_csv(conn)

    return {"ok": True, "already_registered": False, "email": email}


@app.get("/api/waitlist/count")
def waitlist_count() -> dict:
    with db_conn() as conn:
        return {"count": count_signups(conn)}


@app.get("/api/waitlist/export")
def export_waitlist():
    with db_conn() as conn:
        rows = list_signups(conn)
    if not rows:
        raise HTTPException(status_code=404, detail="No signups yet")

    # Always stream CSV so Postgres mode also exports.
    import io

    buf = io.StringIO()
    writer = csv.DictWriter(
        buf,
        fieldnames=["email", "name", "role", "locale", "source", "user_agent", "created_at"],
    )
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
    return PlainTextResponse(
        buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="waitlist.csv"'},
    )


@app.get("/")
def index() -> FileResponse:
    return FileResponse(ROOT / "index.html")


app.mount("/", StaticFiles(directory=ROOT, html=True), name="static")


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8787"))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)
