/**
 * Newsletter & Factsheet Widget
 * Embeddable widget for displaying newsletters and factsheets
 *
 * Usage:
 * <div id="newsletter-widget"></div>
 * <script src="https://cdn.jsdelivr.net/gh/username/repo@main/widget.js"></script>
 * <script>
 *   NewsletterWidget.init({
 *     targetId: 'newsletter-widget',
 *     apiKey: 'your-api-key',
 *     apiBaseUrl: 'https://content-api-2020-5886a3310333.herokuapp.com/api'
 *   });
 * </script>
 */

(function (window) {
  "use strict";

  // Default configuration
  const defaults = {
    apiBaseUrl: "https://content-api-2020-5886a3310333.herokuapp.com/api",
    apiKey: "",
    targetId: "newsletter-widget",
    title: "Newsletters & Factsheets",
    showTitle: true,
  };

  // Load CSS if not already loaded
  function loadCSS() {
    if (document.getElementById("newsletter-widget-css")) {
      return;
    }

    const link = document.createElement("link");
    link.id = "newsletter-widget-css";
    link.rel = "stylesheet";
    link.type = "text/css";

    // Try to load from jsDelivr, fallback to relative path
    const scriptTag = document.querySelector('script[src*="widget.js"]');
    if (scriptTag && scriptTag.src) {
      const baseUrl = scriptTag.src.replace("widget.js", "");
      link.href = baseUrl + "widget.css";
    } else {
      link.href = "widget.css";
    }

    document.head.appendChild(link);
  }

  // Format sections for display
  function formatSections(sections) {
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return "<p class='empty'>No sections available</p>";
    }

    let sectionsHTML = "";
    sections.forEach((section) => {
      sectionsHTML += `
        <div class="section">
          <h4>${escapeHtml(section.title || "Untitled Section")}</h4>
          ${
            section.content && Array.isArray(section.content)
              ? section.content
                  .map(
                    (content) =>
                      `<div class="section-content">${escapeHtml(
                        content
                      )}</div>`
                  )
                  .join("")
              : ""
          }
        </div>
      `;
    });
    return sectionsHTML;
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    if (typeof text !== "string") return text;
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Render newsletters
  function renderNewsletters(newsletters, container) {
    if (!newsletters || newsletters.length === 0) {
      container.innerHTML = '<p class="empty">No newsletters found</p>';
      return;
    }

    let html = "";
    newsletters.forEach((newsletter) => {
      const title = newsletter.title || "No title";
      const intro = newsletter.intro || "No introduction";
      const sections = newsletter.sections || [];
      const link = newsletter.link || "";
      const createdAt = newsletter.createdAt
        ? new Date(newsletter.createdAt).toLocaleDateString()
        : "";

      html += `
        <div class="item">
          <h3>${escapeHtml(title)}</h3>
          ${createdAt ? `<p><small>Created: ${createdAt}</small></p>` : ""}
          <p>${escapeHtml(intro)}</p>
          ${formatSections(sections)}
          ${
            link
              ? `<p><a href="${escapeHtml(
                  link
                )}" target="_blank" rel="noopener noreferrer">View Link: ${escapeHtml(
                  link
                )}</a></p>`
              : ""
          }
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // Render factsheets
  function renderFactsheets(factsheets, container) {
    if (!factsheets || factsheets.length === 0) {
      container.innerHTML = '<p class="empty">No factsheets found</p>';
      return;
    }

    let html = "";
    factsheets.forEach((factsheet) => {
      const title = factsheet.title || "No title";
      const intro = factsheet.intro || "No introduction";
      const sections = factsheet.sections || [];
      const link = factsheet.link || "";
      const createdAt = factsheet.createdAt
        ? new Date(factsheet.createdAt).toLocaleDateString()
        : "";

      html += `
        <div class="item">
          <h3>${escapeHtml(title)}</h3>
          ${createdAt ? `<p><small>Created: ${createdAt}</small></p>` : ""}
          <p>${escapeHtml(intro)}</p>
          ${formatSections(sections)}
          ${
            link
              ? `<p><a href="${escapeHtml(
                  link
                )}" target="_blank" rel="noopener noreferrer">View Link: ${escapeHtml(
                  link
                )}</a></p>`
              : ""
          }
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // Main widget class
  const NewsletterWidget = {
    config: {},
    targetElement: null,

    init: function (options) {
      // Merge options with defaults
      this.config = Object.assign({}, defaults, options);

      if (!this.config.apiKey) {
        console.error("NewsletterWidget: API key is required");
        return;
      }

      // Find target element
      this.targetElement = document.getElementById(this.config.targetId);
      if (!this.targetElement) {
        console.error(
          `NewsletterWidget: Target element with id "${this.config.targetId}" not found`
        );
        return;
      }

      // Load CSS
      loadCSS();

      // Add widget class to target element
      this.targetElement.classList.add("newsletter-widget");

      // Render initial HTML structure
      this.render();

      // Fetch and display data
      this.fetchData();
    },

    render: function () {
      const titleHTML = this.config.showTitle
        ? `<h1>${escapeHtml(this.config.title)}</h1>`
        : "";

      this.targetElement.innerHTML = `
        ${titleHTML}
        <div class="container">
          <div class="column">
            <h2>Newsletters</h2>
            <div id="newsletters-result" class="loading">
              Loading newsletters...
            </div>
          </div>
          <div class="column">
            <h2>Factsheets</h2>
            <div id="factsheets-result" class="loading">Loading factsheets...</div>
          </div>
        </div>
      `;
    },

    fetchData: function () {
      const newslettersResult = document.getElementById("newsletters-result");
      const factsheetsResult = document.getElementById("factsheets-result");

      // Fetch newsletters
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
          console.log("Newsletters API Response:", data);

          if (!data || !data.data || !data.data.newsletters) {
            newslettersResult.innerHTML = `
              <div class="error">Error: Unexpected response structure</div>
              <pre>${JSON.stringify(data, null, 2)}</pre>
            `;
            return;
          }

          const newsletters = data.data.newsletters;
          renderNewsletters(newsletters, newslettersResult);
        })
        .catch((error) => {
          console.error("Error fetching newsletters:", error);
          newslettersResult.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        });

      // Fetch factsheets
      fetch(`${this.config.apiBaseUrl}/factsheets`, {
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
          console.log("Factsheets API Response:", data);

          if (!data || !data.data || !data.data.factsheets) {
            factsheetsResult.innerHTML = `
              <div class="error">Error: Unexpected response structure</div>
              <pre>${JSON.stringify(data, null, 2)}</pre>
            `;
            return;
          }

          const factsheets = data.data.factsheets;
          renderFactsheets(factsheets, factsheetsResult);
        })
        .catch((error) => {
          console.error("Error fetching factsheets:", error);
          factsheetsResult.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        });
    },
  };

  // Expose to global scope
  window.NewsletterWidget = NewsletterWidget;
})(window);
