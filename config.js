// Google Form 报名配置
// 1. 新建表单，加一个「邮箱」简答题（必填）
// 2. 右上角 ⋮ → 获取预填链接 → 填一个测试邮箱 → 获取链接
// 3. 把预填链接发给助手，或自行填到下面两项：
//    formAction: https://docs.google.com/forms/d/e/XXXX/formResponse
//    emailEntryId: entry.123456789
window.WAITLIST_CONFIG = {
  googleForm: {
    formAction: "", // e.g. "https://docs.google.com/forms/d/e/1FAIpQLSxxxx/formResponse"
    emailEntryId: "", // e.g. "entry.123456789"
  },
};
