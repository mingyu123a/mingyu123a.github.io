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
