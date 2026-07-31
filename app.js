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
    },
    en: {
      logoMain: "Your AI Vlog Director",
      badge: "Early Access",
      title: "Javen",
      desc: "Your AI Vlog Director. Leave your email and we'll notify you when it's ready.",
      signupTitle: "Leave your email",
      emailPlaceholder: "your@email.com",
      submit: "I want access",
      successTitle: "✓ You're on the list",
      successDesc: "We'll email you with updates. Thanks for your interest in Javen.",
      success: "Submitted!",
      duplicate: "This email is already registered",
      error: "Failed, please try again",
      invalidEmail: "Enter a valid email",
    },
  };

  let lang = "zh";

  function t(key) {
    const text = I18N[lang][key] || I18N.zh[key] || key;
    return text;
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

  function apiUrl(path) {
    const base = (window.WAITLIST_CONFIG?.apiUrl || "/api/waitlist").replace(/\/api\/waitlist$/, "");
    return `${base}${path}`;
  }

  function showSuccess() {
    document.getElementById("signupCard").classList.add("hidden");
    document.getElementById("successCard").classList.remove("hidden");
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
      const res = await fetch(apiUrl("/api/waitlist"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          locale: lang,
          source: location.href,
          user_agent: navigator.userAgent,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok && res.status !== 409) throw new Error();

      if (data.already_registered) {
        msg.textContent = t("duplicate");
        msg.className = "msg success";
      } else {
        msg.textContent = t("success");
        msg.className = "msg success";
      }
      showSuccess();
    } catch (_) {
      msg.textContent = t("error");
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
