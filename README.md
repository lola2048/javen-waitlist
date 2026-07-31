# Javen Waitlist

Javen（AI Vlog 导演）抢先体验报名页。

## 本地预览

```bash
pip install -r requirements.txt
python server.py
```

打开 http://localhost:8787

本地默认用 SQLite（`data/waitlist.db`）。

## 部署（Render）— 持久化报名数据

免费 Web Service **不能**挂磁盘，休眠/重新部署会清空本地 SQLite。  
请配一个 **Free Postgres**，把连接串设为环境变量 `DATABASE_URL`：

1. Render Dashboard → **New +** → **PostgreSQL** → Free  
2. 创建后复制 **Internal Database URL**  
3. 打开 Web Service `javen-waitlist` → **Environment** → 新增  
   - Key: `DATABASE_URL`  
   - Value: 刚才的连接串  
4. **Manual Deploy** 一次  

健康检查 `GET /api/health` 里应看到 `"storage":"postgres","persistent":true`。

> 注意：Render Free Postgres 创建后约 30 天会过期；正式长期用请升级数据库套餐。

公网地址：https://javen-waitlist.onrender.com

## 管理接口

| 接口 | 说明 |
|------|------|
| `GET /api/health` | 健康检查（含 storage） |
| `GET /api/waitlist/count` | 报名人数 |
| `GET /api/waitlist/export` | 导出 CSV |
