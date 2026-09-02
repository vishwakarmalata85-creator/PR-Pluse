/**
 * MIRO FAQ ACCORDION COMPONENT
 */

import { FAQ_ITEMS } from "../data/faqData.js";

export class FaqSectionComponent {
  render() {
    return `
      <section class="section-lg" id="faq" role="region" aria-label="Frequently Asked Questions">
        <div class="container" style="max-width: 900px;">
          
          <div style="text-align: center; margin-bottom: var(--space-xl);">
            <span class="badge-tag-yellow" style="margin-bottom: var(--space-xs);">Questions & Answers</span>
            <h2 class="display-lg">Frequently Asked Questions</h2>
          </div>

          <div class="faq-accordion" id="faq-list">
            ${FAQ_ITEMS.map((faq, i) => `
              <div class="faq-accordion-item ${i === 0 ? 'open' : ''}">
                <button class="faq-question" aria-expanded="${i === 0 ? 'true' : 'false'}">
                  <span class="heading-4" style="color: var(--color-ink);">${faq.question}</span>
                  <span class="faq-toggle-icon">▼</span>
                </button>
                <div class="faq-answer">
                  ${faq.answer}
                </div>
              </div>
            `).join("")}
          </div>

        </div>
      </section>
    `;
  }

  bindEvents() {
    const faqList = document.getElementById("faq-list");
    if (faqList) {
      faqList.querySelectorAll(".faq-question").forEach(q => {
        q.addEventListener("click", () => {
          const item = q.closest(".faq-accordion-item");
          const isOpen = item.classList.contains("open");
          
          // Close all
          faqList.querySelectorAll(".faq-accordion-item").forEach(i => i.classList.remove("open"));
          
          if (!isOpen) {
            item.classList.add("open");
          }
        });
      });
    }
  }
}
