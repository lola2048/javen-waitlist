# Javen Waitlist

Javen（AI Vlog 导演）抢先体验报名页。报名邮箱写入 **Google 表单 / 表格**，不依赖服务器数据库。

## 本地预览

```bash
pip install -r requirements.txt
python server.py
```

打开 http://localhost:8787

## 连接 Google 表单

1. 打开 [Google 表单](https://forms.google.com/create)
2. 标题随意，例如「Javen 抢先体验」
3. 添加 **1 个简答题**：邮箱（设为必填）
4. 右上角 **⋮ → 获取预填链接**
5. 在邮箱里填一个测试地址 → **获取链接**
6. 把完整预填链接发给开发者，或自行填入 `config.js`：

```js
window.WAITLIST_CONFIG = {
  googleForm: {
    formAction: "https://docs.google.com/forms/d/e/XXXX/formResponse",
    emailEntryId: "entry.123456789",
  },
};
```

预填链接示例：

`https://docs.google.com/forms/d/e/XXXX/viewform?usp=pp_url&entry.123456789=test@example.com`

- `XXXX` → `formAction` 里的 ID（把 `viewform` 改成 `formResponse`）
- `entry.123456789` → `emailEntryId`

表单「回答」页可同步到 Google 表格，方便导出。

## 部署

推送到 GitHub 后 Render 会自动部署静态页 + 轻量服务：https://javen-waitlist.onrender.com

## 管理

报名数据请在对应 Google 表单 / 表格里查看，不再使用服务器 SQLite/Postgres。
