# Javen Waitlist

Javen（AI Vlog 导演）抢先体验报名页。

## 本地预览

```bash
pip install -r requirements.txt
python server.py
```

打开 http://localhost:8787

## 部署（Render）

1. 把本仓库连接到 [Render](https://dashboard.render.com)
2. 用 Blueprint / Web Service 部署（见 `render.yaml`）
3. 公网地址示例：https://javen-waitlist.onrender.com

## 管理接口

| 接口 | 说明 |
|------|------|
| `GET /api/health` | 健康检查 |
| `GET /api/waitlist/count` | 报名人数 |
| `GET /api/waitlist/export` | 导出 CSV |
