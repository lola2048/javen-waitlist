(function () {
  "use strict";

  const I18N = {
    zh: {
      logoMain: "你的 AI Vlog 导演",
      badge: "首批体验官招募",
      joinLink: "申请体验",
      emailLabel: "邮箱",
      signupTag: "限量开放",
      heroTitle: "向前走\n你眼里的世界\n值得好好讲",
      p1: "剪辑软件帮你整理画面。",
      p2: "Javen 想帮你找回按下录制的理由。",
      p3: "你为什么在那一刻\n按下录制？",
      p4: "透过镜头留下的，从来不只是画面。",
      o1: "我们谓之「普通」",
      o2: "不是因为它平庸",
      o3: "而是因为它 只属于你",
      o4: "普通的生活，不等于没有故事。",
      m1: "这一刻，对我很重要",
      m2: "按下录制的瞬间，故事就开始了。",
      m3: "你不是没有故事\n只是还没有人帮你看见它",
      f0: "这就是 Javen 想成为的角色",
      fTitle: "你的 AI Vlog 导演",
      f1: "自动提取高光片段",
      f2: "AI 生成 Hook",
      f3: "故事结构智能编排",
      f4: "视频配文生成",
      f5: "声音克隆",
      f6: "音视频智能分离",
      fValue: "它不替你制造不存在的精彩\n只是把你真正经历过的，好好还给你。",
      ctaKicker: "你只需拍下生活",
      ctaSub: "剩下的，交给 Javen。",
      ctaTitle: "首批「体验官」招募中",
      ctaDesc: "如果你的相册里，也有一段还没讲完的故事\n留下邮箱，成为首批体验用户。",
      signupTitle: "申请体验席位",
      emailPlaceholder: "your@email.com",
      socialLabel: "自媒体主页链接（选填）",
      socialPlaceholder: "https://小红书 / 抖音 / B站 / Instagram…",
      socialHint: "我们会优先邀请不同风格的博主参与测试；测试期间免费。",
      submit: "申请体验",
      note: "仅用于产品开放通知，不会骚扰你。",
      wechatOr: "加入体验官微信群",
      wechatBtn: "微信加群",
      wechatTitle: "欢迎加入体验官微信群",
      wechatHint: "扫码进群，和我们一起打磨 Javen",
      wechatExpire: "二维码约 7 天内有效，过期请联系我们更新",
      successTitle: "✓ 已收到申请",
      successDesc: "扫码加入体验官微信群，我们会在群内同步进展。",
      footerTag: "AI Vlog Director · Early Access",
      success: "提交成功！",
      duplicate: "该邮箱已登记过",
      error: "提交失败，请重试",
      invalidEmail: "请输入有效邮箱",
      notConfigured: "报名通道尚未配置，请稍后再试",
    },
    en: {
      logoMain: "Your AI Vlog Director",
      badge: "First Experience Officers",
      joinLink: "Apply",
      emailLabel: "Email",
      signupTag: "Limited",
      heroTitle: "Keep going\nThe world in your eyes\nis worth telling well",
      p1: "Editors organize your footage.",
      p2: "Javen helps you remember why you hit record.",
      p3: "Why did you press record\nin that moment?",
      p4: "What the lens keeps is never just a picture.",
      o1: "We call it “ordinary”",
      o2: "not because it’s dull",
      o3: "but because it belongs only to you",
      o4: "Ordinary life doesn’t mean no story.",
      m1: "This moment matters to me",
      m2: "The story starts the second you hit record.",
      m3: "You don’t lack a story\nYou just haven’t had anyone help you see it",
      f0: "The role Javen wants to play",
      fTitle: "Your AI Vlog Director",
      f1: "Auto highlight clips",
      f2: "AI-generated hooks",
      f3: "Smart story structure",
      f4: "Caption generation",
      f5: "Voice cloning",
      f6: "Smart A/V separation",
      fValue: "It doesn’t invent excitement you never lived\nIt simply returns what you truly experienced.",
      ctaKicker: "You just film your life",
      ctaSub: "Javen handles the rest.",
      ctaTitle: "First Experience Officers Open",
      ctaDesc: "If your camera roll still holds an unfinished story\nLeave your email to join the first batch.",
      signupTitle: "Apply for early access",
      emailPlaceholder: "your@email.com",
      socialLabel: "Creator homepage (optional)",
      socialPlaceholder: "https://Xiaohongshu / Douyin / Bilibili / Instagram…",
      socialHint: "We prioritize creators with different styles for testing. Free during the beta.",
      submit: "Apply now",
      note: "Only used to notify you when we open. No spam.",
      wechatOr: "Join the WeChat group",
      wechatBtn: "Join WeChat",
      wechatTitle: "Welcome to the experience officer group",
      wechatHint: "Scan to join — let’s build Javen together",
      wechatExpire: "QR code is valid for about 7 days",
      successTitle: "✓ You're on the list",
      successDesc: "Scan to join the WeChat group — we'll share updates there.",
      footerTag: "AI Vlog Director · Early Access",
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

  function setHtmlOrText(el, text) {
    if (text.includes("\n")) {
      el.innerHTML = text.split("\n").map((line) => escapeHtml(line)).join("<br/>");
    } else {
      el.textContent = text;
    }
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function applyLanguage() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      let text = t(key);

      // Keep blue highlight on o3 / hero last line
      if (key === "o3") {
        if (lang === "zh") {
          el.innerHTML = "而是因为它 <span class=\"hi\">只属于你</span>";
        } else {
          el.innerHTML = "but because it <span class=\"hi\">belongs only to you</span>";
        }
        return;
      }

      if (key === "heroTitle") {
        if (lang === "zh") {
          el.innerHTML = "向前走<br/>你眼里的世界<br/><em>值得好好讲</em>";
        } else {
          el.innerHTML = "Keep going<br/>The world in your eyes<br/><em>is worth telling well</em>";
        }
        return;
      }

      setHtmlOrText(el, text);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
    });
    const toggle = document.getElementById("langToggle");
    if (toggle) toggle.textContent = lang === "zh" ? "EN" : "中文";
  }

  function googleFormConfig() {
    const cfg = window.WAITLIST_CONFIG?.googleForm || {};
    return {
      formAction: (cfg.formAction || "").trim(),
      emailEntryId: (cfg.emailEntryId || "").trim(),
      socialEntryId: (cfg.socialEntryId || "").trim(),
    };
  }

  let openWechatModal = () => {};
  let closeWechatModal = () => {};

  function showSuccess() {
    document.getElementById("signupCard").classList.add("hidden");
    document.getElementById("successCard").classList.remove("hidden");
    openWechatModal();
  }

  async function submitToGoogleForm(email, social) {
    const { formAction, emailEntryId, socialEntryId } = googleFormConfig();
    if (!formAction || !emailEntryId) {
      throw new Error("not_configured");
    }

    const body = new FormData();
    // Form currently has one short-answer field; keep email clean when possible,
    // and append social link in the same cell when no dedicated entry exists.
    if (social && socialEntryId) {
      body.append(emailEntryId, email);
      body.append(socialEntryId, social);
    } else if (social) {
      body.append(emailEntryId, `${email} | ${social}`);
    } else {
      body.append(emailEntryId, email);
    }

    await fetch(formAction, {
      method: "POST",
      mode: "no-cors",
      body,
    });
  }

  async function handleJoin(email, social) {
    const msg = document.getElementById("formMessage");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = t("invalidEmail");
      msg.className = "msg error";
      return;
    }

    const btn = document.getElementById("submitBtn");
    btn.disabled = true;

    try {
      await submitToGoogleForm(email, social);
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

  function initReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );
    nodes.forEach((el) => io.observe(el));
  }

  function initDock() {
    const dock = document.getElementById("dockCta");
    const signup = document.getElementById("signup");
    if (!dock || !signup) return;

    const sync = () => {
      const rect = signup.getBoundingClientRect();
      const nearSignup = rect.top < window.innerHeight * 0.78;
      const pastHero = window.scrollY > window.innerHeight * 0.55;
      dock.classList.toggle("is-show", pastHero && !nearSignup);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
  }

  function initWechatModal() {
    const modal = document.getElementById("wechatModal");
    if (!modal) return;

    openWechatModal = () => {
      modal.classList.remove("hidden");
      document.body.classList.add("modal-open");
    };
    closeWechatModal = () => {
      modal.classList.add("hidden");
      document.body.classList.remove("modal-open");
    };

    document.getElementById("wechatClose")?.addEventListener("click", closeWechatModal);
    document.getElementById("wechatCloseBg")?.addEventListener("click", closeWechatModal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.classList.contains("hidden")) closeWechatModal();
    });
  }

  function init() {
    applyLanguage();
    initReveal();
    initDock();
    initWechatModal();

    document.getElementById("waitlistForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      handleJoin(
        document.getElementById("email").value.trim().toLowerCase(),
        document.getElementById("social")?.value.trim() || ""
      );
    });

    document.getElementById("langToggle")?.addEventListener("click", () => {
      lang = lang === "zh" ? "en" : "zh";
      applyLanguage();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
