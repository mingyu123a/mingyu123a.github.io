"use strict";
import form from "./form.js";
import skillbar from "./skillbar.js";

document.addEventListener("DOMContentLoaded", () => {
  AOS.init({
    once: true,
  });
  form();
  skillbar();

  const nav = document.querySelector("#nav");
  const navBtn = document.querySelector("#nav-btn");
  const navBtnImg = document.querySelector("#nav-btn-img");
  const velogGrid = document.querySelector("#velog-grid");

  const fallbackVelogPosts = [
    {
      title: "[Oracle] 프로그래머스 SQL 중고거래 댓글 조회하기",
      link: "https://velog.io/@mgh0115/Oracle-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%A8%B8%EC%8A%A4-SQL-%EC%A4%91%EA%B3%A0%EA%B1%B0%EB%9E%98-%EB%8C%93%EA%B8%80-%EC%A1%B0%ED%9A%8C%ED%95%98%EA%B8%B0SELECT",
      tags: ["Oracle", "SQL"],
      desc: "Oracle로 프로그래머스 중고거래 댓글 조회 문제를 풀며 조인과 조건을 정리한 글.",
    },
    {
      title: "[MySQL]학사 시스템 만들기 프로젝트",
      link: "https://velog.io/@mgh0115/MySQL%ED%95%99%EC%82%AC-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EB%A7%8C%EB%93%A4%EA%B8%B0-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8",
      tags: ["MySQL", "DB 설계"],
      desc: "학생·과목·수강 테이블 설계부터 요구사항 분석까지, 학사 시스템 DB 프로젝트 정리.",
    },
    {
      title: "INDEX",
      link: "https://velog.io/@mgh0115/INDEX",
      tags: ["MySQL", "Index"],
      desc: "클러스터형·보조 인덱스 차이와 사용 시점 등 MySQL 인덱스 기본기 노트.",
    },
    {
      title: "제약조건 + VIEW +(인덱스 ,트랜지션 개념 맛보기)",
      link: "https://velog.io/@mgh0115/%EC%A0%9C%EC%95%BD%EC%A1%B0%EA%B1%B4-VIEW-%EC%9D%B8%EB%8D%B1%EC%8A%A4-%ED%8A%B8%EB%9E%9C%EC%A7%80%EC%85%98-%EA%B0%9C%EB%85%90-%EB%A7%9B%EB%B3%B4%EA%B8%B0",
      tags: ["MySQL", "기본기"],
      desc: "PRIMARY KEY, UNIQUE, VIEW, 트랜잭션 개념을 묶어 실습하며 정리.",
    },
  ];

  const excludedTitles = ["layer7", "pwn", "해킹"];

  const renderVelogCards = (posts) => {
    if (!velogGrid) return;
    velogGrid.innerHTML = "";
    posts.forEach((post, idx) => {
      const card = document.createElement("a");
      card.className = "velog-card";
      card.href = post.link;
      card.target = "_blank";
      card.rel = "noreferrer noopener";
      card.dataset.aos = "fade-up";
      card.dataset.aosDuration = "900";
      card.dataset.aosDelay = `${idx * 120}`;

      const tags = (post.tags || []).slice(0, 2);

      card.innerHTML = `
        <div class="velog-card-top">
          ${tags
            .map(
              (tag, tagIdx) =>
                `<span class="velog-pill${tagIdx === 1 ? " pill-outline" : ""}">${tag}</span>`
            )
            .join("")}
        </div>
        <h3 class="velog-card-title">${post.title}</h3>
        <p class="velog-card-desc">${post.desc || ""}</p>
        <div class="velog-card-footer">
          <span class="velog-link-text">글 보러가기</span>
          <span class="velog-arrow">↗</span>
        </div>
      `;

      velogGrid.appendChild(card);
    });
  };

  const loadVelogFeed = async () => {
    if (!velogGrid) return;
    try {
      const res = await fetch("https://v2.velog.io/rss/@mgh0115");
      if (!res.ok) throw new Error("RSS fetch failed");
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "application/xml");
      const items = Array.from(doc.querySelectorAll("item")).slice(0, 6);

      const posts = items
        .map((item) => {
          const title = item.querySelector("title")?.textContent || "";
          const link = item.querySelector("link")?.textContent || "";
          const desc = item.querySelector("description")?.textContent || "";
          return { title, link, desc, tags: [] };
        })
        .filter(
          (p) => !excludedTitles.some((bad) => p.title.toLowerCase().includes(bad.toLowerCase()))
        )
        .slice(0, 4)
        .map((p) => {
          const tags = [];
          const lower = p.title.toLowerCase();
          if (lower.includes("oracle")) tags.push("Oracle");
          if (lower.includes("mysql")) tags.push("MySQL");
          if (lower.includes("sql")) tags.push("SQL");
          if (lower.includes("view")) tags.push("VIEW");
          if (!tags.length) tags.push("Note");
          return { ...p, tags };
        });

      if (!posts.length) {
        renderVelogCards(fallbackVelogPosts);
        return;
      }
      renderVelogCards(posts);
    } catch (e) {
      renderVelogCards(fallbackVelogPosts);
    }
  };

  //Hamburger menu
  navBtn.onclick = () => {
    if (nav.classList.toggle("open")) {
      navBtnImg.src = "img/icons/close.svg";
    } else {
      navBtnImg.src = "img/icons/open.svg";
    }
  };

  const achievementCards = document.querySelectorAll(".achievement-card");
  const achievementTabs = document.querySelectorAll(".achievements-tab");

  if (achievementCards.length && achievementTabs.length) {
    const setActiveTab = (panel) => {
      achievementTabs.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.target === panel);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveTab(visible.target.dataset.panel);
        }
      },
      { threshold: [0.3, 0.6], rootMargin: "-10% 0px -10% 0px" }
    );

    achievementCards.forEach((card) => observer.observe(card));

    achievementTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetPanel = tab.dataset.target;
        const destination = Array.from(achievementCards).find(
          (card) => card.dataset.panel === targetPanel
        );
        if (destination) {
          destination.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          setActiveTab(targetPanel);
        }
      });
    });
  }

  loadVelogFeed();

  window.addEventListener("scroll", function () {
    const header = document.querySelector("#header");
    const hero = document.querySelector("#home");
    let triggerHeight = hero.offsetHeight - 170;

    if (window.scrollY > triggerHeight) {
      header.classList.add("header-sticky");
      goToTop.classList.add("reveal");
    } else {
      header.classList.remove("header-sticky");
      goToTop.classList.remove("reveal");
    }
  });

  let sections = document.querySelectorAll("section");
  let navLinks = document.querySelectorAll("header nav a");

  window.onscroll = () => {
    sections.forEach((sec) => {
      let top = window.scrollY;
      let offset = sec.offsetTop - 170;
      let height = sec.offsetHeight;
      let id = sec.getAttribute("id");

      if (top >= offset && top < offset + height) {
        navLinks.forEach((links) => {
          links.classList.remove("active");
          document
            .querySelector("header nav a[href*=" + id + "]")
            .classList.add("active");
        });
      }
    });
  };
});
