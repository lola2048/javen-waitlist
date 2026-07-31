#!/usr/bin/env python3
"""Early-access signup API for Javen (AI Vlog Director)."""

from __future__ import annotations

import csv
import os
import re
import sqlite3
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
DB_PATH = DATA_DIR / "waitlist.db"
CSV_PATH = DATA_DIR / "waitlist.csv"

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class WaitlistEntry(BaseModel):
    email: EmailStr
    name: str = Field(default="", max_length=120)
    role: str = Field(default="", max_length=64)
    locale: str = Field(default="zh", max_length=8)
    source: str = Field(default="", max_length=512)
    user_agent: str = Field(default="", max_length=512)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Javen Early Access", version="2.1.0", lifespan=lifespan)

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


def init_db() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
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
            """
        )
        conn.commit()


def append_csv(conn: sqlite3.Connection) -> None:
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT email, name, role, locale, source, user_agent, created_at
        FROM waitlist
        ORDER BY created_at ASC
        """
    ).fetchall()
    with CSV_PATH.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["email", "name", "role", "locale", "source", "user_agent", "created_at"],
        )
        writer.writeheader()
        for row in rows:
            writer.writerow(dict(row))


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "service": "javen-early-access"}


@app.post("/api/waitlist")
async def join_waitlist(entry: WaitlistEntry, request: Request) -> dict:
    email = str(entry.email).strip().lower()
    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=422, detail="Invalid email")

    created_at = utc_now()

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        existing = conn.execute(
            "SELECT email FROM waitlist WHERE email = ? COLLATE NOCASE",
            (email,),
        ).fetchone()
        if existing:
            return {"ok": True, "already_registered": True, "email": email}

        conn.execute(
            """
            INSERT INTO waitlist (email, name, role, locale, source, user_agent, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                email,
                entry.name.strip(),
                entry.role.strip(),
                entry.locale.strip() or "zh",
                entry.source.strip() or str(request.headers.get("referer", "")),
                entry.user_agent.strip() or request.headers.get("user-agent", ""),
                created_at,
            ),
        )
        conn.commit()
        append_csv(conn)

    return {"ok": True, "already_registered": False, "email": email}


@app.get("/api/waitlist/count")
def waitlist_count() -> dict:
    with sqlite3.connect(DB_PATH) as conn:
        (count,) = conn.execute("SELECT COUNT(*) FROM waitlist").fetchone()
    return {"count": count}


@app.get("/api/waitlist/export")
def export_waitlist() -> FileResponse:
    if not CSV_PATH.exists():
        raise HTTPException(status_code=404, detail="No signups yet")
    return FileResponse(CSV_PATH, filename="waitlist.csv", media_type="text/csv")


@app.get("/")
def index() -> FileResponse:
    return FileResponse(ROOT / "index.html")


app.mount("/", StaticFiles(directory=ROOT, html=True), name="static")


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8787"))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)
