(function () {
  "use strict";

  const I18N = {
    zh: {
      logoMain: "你的 AI Vlog 导演",
      badge: "抢先体验",
      title: "Javen",
      desc: "你的 AI Vlog 导演。留下邮箱，产品上线后第一时间通知你。",
      signupTitle: "留下邮箱",
      emailPlaceholder: "your@email.com",
      submit: "我要体验",
      successTitle: "✓ 已收到申请",
      successDesc: "产品开放时我们会通过邮箱通知你，感谢关注 Javen。",
      success: "提交成功！",
      duplicate: "该邮箱已登记过",
      error: "提交失败，请重试",
      invalidEmail: "请输入有效邮箱",
      notConfigured: "报名通道尚未配置，请稍后再试",
    },
    en: {
      logoMain: "Your AI Vlog Director",
      badge: "Early Access",
      title: "Javen",
      desc: "Your AI Vlog Director. Leave your email and we'll notify you when it's ready.",
      signupTitle: "Leave your email",
      emailPlaceholder: "your@email.com",
      submit: "Try it now",
      successTitle: "✓ You're on the list",
      successDesc: "We'll email you with updates. Thanks for your interest in Javen.",
      success: "Submitted!",
      duplicate: "This email is already registered",
      error: "Failed, please try again",
      invalidEmail: "Enter a valid email",
      notConfigured: "Signup is not configured yet. Please try again later.",
    },
  };

  let lang = "zh";

  function t(key) {
    return I18N[lang][key] || I18N.zh[key] || key;
  }

  function applyLanguage() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const text = t(key);
      if (key === "title" && text.includes("\n")) {
        el.innerHTML = text.replace("\n", "<br/>");
      } else {
        el.textContent = text;
      }
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
    });
    document.getElementById("langToggle").textContent = lang === "zh" ? "EN" : "中文";
  }

  function googleFormConfig() {
    const cfg = window.WAITLIST_CONFIG?.googleForm || {};
    return {
      formAction: (cfg.formAction || "").trim(),
      emailEntryId: (cfg.emailEntryId || "").trim(),
    };
  }

  function showSuccess() {
    document.getElementById("signupCard").classList.add("hidden");
    document.getElementById("successCard").classList.remove("hidden");
  }

  async function submitToGoogleForm(email) {
    const { formAction, emailEntryId } = googleFormConfig();
    if (!formAction || !emailEntryId) {
      throw new Error("not_configured");
    }

    const body = new FormData();
    body.append(emailEntryId, email);

    // Google Forms does not return CORS headers; no-cors still delivers the submission.
    await fetch(formAction, {
      method: "POST",
      mode: "no-cors",
      body,
    });
  }

  async function handleJoin(email) {
    const msg = document.getElementById("formMessage");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = t("invalidEmail");
      msg.className = "msg error";
      return;
    }

    const btn = document.getElementById("submitBtn");
    btn.disabled = true;

    try {
      await submitToGoogleForm(email);
      msg.textContent = t("success");
      msg.className = "msg success";
      showSuccess();
    } catch (err) {
      msg.textContent = err && err.message === "not_configured" ? t("notConfigured") : t("error");
      msg.className = "msg error";
    } finally {
      btn.disabled = false;
    }
  }

  function init() {
    applyLanguage();

    document.getElementById("waitlistForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      handleJoin(document.getElementById("email").value.trim().toLowerCase());
    });

    document.getElementById("langToggle")?.addEventListener("click", () => {
      lang = lang === "zh" ? "en" : "zh";
      applyLanguage();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
