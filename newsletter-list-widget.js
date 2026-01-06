/**
 * Newsletter List Widget
 * Shows newsletter titles, dates, and "Read more" buttons
 *
 * Usage:
 * <div id="newsletter-list-widget"></div>
 * <script src="https://cdn.jsdelivr.net/gh/username/repo@main/newsletter-list-widget.js"></script>
 * <script>
 *   NewsletterListWidget.init({
 *     targetId: 'newsletter-list-widget',
 *     apiKey: 'your-api-key',
 *     apiBaseUrl: 'https://content-api-2020-5886a3310333.herokuapp.com/api',
 *     detailPageUrl: 'newsletter-detail.html' // URL to detail page
 *   });
 * </script>
 */

(function (window) {
  "use strict";

  // Default configuration
  const defaults = {
    apiBaseUrl: "https://content-api-2020-5886a3310333.herokuapp.com/api",
    apiKey: "",
    targetId: "newsletter-list-widget",
    title: "Newsletters",
    showTitle: true,
    detailPageUrl: "newsletter-detail.html", // Default detail page URL
  };

  // Load CSS if not already loaded
  function loadCSS() {
    if (document.getElementById("newsletter-list-widget-css")) {
      return;
    }

    const link = document.createElement("link");
    link.id = "newsletter-list-widget-css";
    link.rel = "stylesheet";
    link.type = "text/css";

    const scriptTag = document.querySelector('script[src*="newsletter-list-widget.js"]');
    if (scriptTag && scriptTag.src) {
      const baseUrl = scriptTag.src.replace("newsletter-list-widget.js", "");
      link.href = baseUrl + "newsletter-list-widget.css";
    } else {
      link.href = "newsletter-list-widget.css";
    }

    document.head.appendChild(link);
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    if (typeof text !== "string") return text;
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Get ID from newsletter object (handles both _id and id)
  function getNewsletterId(newsletter) {
    return newsletter._id || newsletter.id || "";
  }

  // Render newsletter list
  function renderNewsletterList(newsletters, container, detailPageUrl) {
    if (!newsletters || newsletters.length === 0) {
      container.innerHTML = '<p class="empty">No newsletters found</p>';
      return;
    }

    let html = "";
    newsletters.forEach((newsletter) => {
      const title = newsletter.title || "No title";
      const createdAt = newsletter.createdAt
        ? new Date(newsletter.createdAt).toLocaleDateString()
        : "";
      const id = getNewsletterId(newsletter);
      const detailUrl = detailPageUrl + (detailPageUrl.includes("?") ? "&" : "?") + "id=" + encodeURIComponent(id);

      html += `
        <div class="list-item">
          <div class="list-item-content">
            ${createdAt ? `<p class="list-item-date">${createdAt}</p>` : ""}
            <h3>${escapeHtml(title)}</h3>
          </div>
          <a href="${escapeHtml(detailUrl)}" class="read-more-btn">Read more</a>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // Main widget class
  const NewsletterListWidget = {
    config: {},
    targetElement: null,

    init: function (options) {
      this.config = Object.assign({}, defaults, options);

      if (!this.config.apiKey) {
        console.error("NewsletterListWidget: API key is required");
        return;
      }

      this.targetElement = document.getElementById(this.config.targetId);
      if (!this.targetElement) {
        console.error(
          `NewsletterListWidget: Target element with id "${this.config.targetId}" not found`
        );
        return;
      }

      loadCSS();
      this.targetElement.classList.add("newsletter-list-widget");
      this.render();
      this.fetchData();
    },

    render: function () {
      const titleHTML = this.config.showTitle
        ? `<h1>${escapeHtml(this.config.title)}</h1>`
        : "";

      this.targetElement.innerHTML = `
        ${titleHTML}
        <div class="list-container" id="newsletter-list-result">
          <div class="loading">
            Loading newsletters...
          </div>
        </div>
      `;
    },

    fetchData: function () {
      const listResult = document.getElementById("newsletter-list-result");

      fetch(`${this.config.apiBaseUrl}/newsletters`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((errorData) => {
              throw new Error(
                errorData.message || `HTTP error! status: ${response.status}`
              );
            });
          }
          return response.json();
        })
        .then((data) => {
          if (!data || !data.data || !data.data.newsletters) {
            listResult.innerHTML = `
              <div class="error">Error: Unexpected response structure</div>
              <pre>${JSON.stringify(data, null, 2)}</pre>
            `;
            return;
          }

          const newsletters = data.data.newsletters;
          // Clear loading state and render items directly into the grid container
          listResult.innerHTML = "";
          renderNewsletterList(newsletters, listResult, this.config.detailPageUrl);
        })
        .catch((error) => {
          console.error("Error fetching newsletters:", error);
          listResult.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        });
    },
  };

  window.NewsletterListWidget = NewsletterListWidget;
})(window);

