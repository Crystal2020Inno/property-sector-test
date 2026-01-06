/**
 * Newsletter Detail Widget
 * Shows full newsletter content by ID
 *
 * Usage:
 * <div id="newsletter-detail-widget"></div>
 * <script src="https://cdn.jsdelivr.net/gh/username/repo@main/newsletter-detail-widget.js"></script>
 * <script>
 *   NewsletterDetailWidget.init({
 *     targetId: 'newsletter-detail-widget',
 *     apiKey: 'your-api-key',
 *     apiBaseUrl: 'https://content-api-2020-5886a3310333.herokuapp.com/api',
 *     newsletterId: '123' // or get from URL: new URLSearchParams(window.location.search).get('id')
 *   });
 * </script>
 */

(function (window) {
  "use strict";

  const defaults = {
    apiBaseUrl: "https://content-api-2020-5886a3310333.herokuapp.com/api",
    apiKey: "",
    targetId: "newsletter-detail-widget",
    newsletterId: null, // Will try to get from URL if not provided
  };

  function loadCSS() {
    if (document.getElementById("newsletter-detail-widget-css")) {
      return;
    }

    const link = document.createElement("link");
    link.id = "newsletter-detail-widget-css";
    link.rel = "stylesheet";
    link.type = "text/css";

    const scriptTag = document.querySelector('script[src*="newsletter-detail-widget.js"]');
    if (scriptTag && scriptTag.src) {
      const baseUrl = scriptTag.src.replace("newsletter-detail-widget.js", "");
      link.href = baseUrl + "newsletter-detail-widget.css";
    } else {
      link.href = "newsletter-detail-widget.css";
    }

    document.head.appendChild(link);
  }

  function escapeHtml(text) {
    if (typeof text !== "string") return text;
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function sanitizeHtml(html) {
    if (typeof html !== "string") return html;
    
    const temp = document.createElement("div");
    temp.innerHTML = html;
    
    const dangerousTags = ["script", "iframe", "object", "embed", "form", "input", "button"];
    dangerousTags.forEach((tag) => {
      const elements = temp.querySelectorAll(tag);
      elements.forEach((el) => el.remove());
    });
    
    const allElements = temp.querySelectorAll("*");
    allElements.forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        if (
          attr.name.startsWith("on") ||
          (attr.name === "href" && attr.value.toLowerCase().startsWith("javascript:")) ||
          (attr.name === "src" && attr.value.toLowerCase().startsWith("javascript:"))
        ) {
          el.removeAttribute(attr.name);
        }
      });
    });
    
    return temp.innerHTML;
  }

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
                      `<div class="section-content">${sanitizeHtml(
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

  function renderNewsletterDetail(newsletter, container) {
    const title = newsletter.title || "No title";
    const intro = newsletter.intro || "No introduction";
    const sections = newsletter.sections || [];
    const link = newsletter.link || "";
    const createdAt = newsletter.createdAt
      ? new Date(newsletter.createdAt).toLocaleDateString()
      : "";

    container.innerHTML = `
      <div class="detail-item">
        <h1>${escapeHtml(title)}</h1>
        ${createdAt ? `<p class="detail-date">Published: ${createdAt}</p>` : ""}
        <div class="detail-intro">${sanitizeHtml(intro)}</div>
        ${formatSections(sections)}
        ${
          link
            ? `<p class="detail-link"><a href="${escapeHtml(
                link
              )}" target="_blank" rel="noopener noreferrer">View Link: ${escapeHtml(
                link
              )}</a></p>`
            : ""
        }
      </div>
    `;
  }

  const NewsletterDetailWidget = {
    config: {},
    targetElement: null,

    init: function (options) {
      this.config = Object.assign({}, defaults, options);

      if (!this.config.apiKey) {
        console.error("NewsletterDetailWidget: API key is required");
        return;
      }

      // Get ID from options, URL parameter, or error
      if (!this.config.newsletterId) {
        const urlParams = new URLSearchParams(window.location.search);
        this.config.newsletterId = urlParams.get("id");
      }

      if (!this.config.newsletterId) {
        console.error("NewsletterDetailWidget: Newsletter ID is required");
        const target = document.getElementById(this.config.targetId);
        if (target) {
          target.innerHTML = '<div class="error">Error: Newsletter ID not found. Please provide an ID in the URL (?id=...) or in the init options.</div>';
        }
        return;
      }

      this.targetElement = document.getElementById(this.config.targetId);
      if (!this.targetElement) {
        console.error(
          `NewsletterDetailWidget: Target element with id "${this.config.targetId}" not found`
        );
        return;
      }

      loadCSS();
      this.targetElement.classList.add("newsletter-detail-widget");
      this.render();
      this.fetchData();
    },

    render: function () {
      this.targetElement.innerHTML = `
        <div id="newsletter-detail-result" class="loading">
          Loading newsletter...
        </div>
      `;
    },

    fetchData: function () {
      const detailResult = document.getElementById("newsletter-detail-result");

      // Try both endpoints: /newsletters/:id and /newsletters?id=...
      const id = this.config.newsletterId;
      const url = `${this.config.apiBaseUrl}/newsletters/${id}`;

      fetch(url, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            // If endpoint doesn't exist, try fetching all and filtering
            if (response.status === 404) {
              return fetch(`${this.config.apiBaseUrl}/newsletters`, {
                headers: {
                  Authorization: `Bearer ${this.config.apiKey}`,
                  "Content-Type": "application/json",
                },
              }).then((listResponse) => {
                if (!listResponse.ok) throw new Error(`HTTP error! status: ${listResponse.status}`);
                return listResponse.json();
              }).then((listData) => {
                if (!listData || !listData.data || !listData.data.newsletters) {
                  throw new Error("Unexpected response structure");
                }
                const newsletter = listData.data.newsletters.find(
                  (n) => (n._id || n.id) === id
                );
                if (!newsletter) {
                  throw new Error("Newsletter not found");
                }
                return { data: { newsletter } };
              });
            }
            return response.json().then((errorData) => {
              throw new Error(
                errorData.message || `HTTP error! status: ${response.status}`
              );
            });
          }
          return response.json();
        })
        .then((data) => {
          const newsletter = data.data?.newsletter || data.data?.newsletters?.[0] || data;
          if (!newsletter) {
            detailResult.innerHTML = `
              <div class="error">Error: Newsletter not found</div>
            `;
            return;
          }

          renderNewsletterDetail(newsletter, detailResult);
        })
        .catch((error) => {
          console.error("Error fetching newsletter:", error);
          detailResult.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        });
    },
  };

  window.NewsletterDetailWidget = NewsletterDetailWidget;
})(window);

