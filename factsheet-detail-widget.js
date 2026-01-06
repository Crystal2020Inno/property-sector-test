/**
 * Factsheet Detail Widget
 * Shows full factsheet content by ID
 *
 * Usage:
 * <div id="factsheet-detail-widget"></div>
 * <script src="https://cdn.jsdelivr.net/gh/username/repo@main/factsheet-detail-widget.js"></script>
 * <script>
 *   FactsheetDetailWidget.init({
 *     targetId: 'factsheet-detail-widget',
 *     apiKey: 'your-api-key',
 *     apiBaseUrl: 'https://content-api-2020-5886a3310333.herokuapp.com/api',
 *     factsheetId: '123' // or get from URL: new URLSearchParams(window.location.search).get('id')
 *   });
 * </script>
 */

(function (window) {
  "use strict";

  const defaults = {
    apiBaseUrl: "https://content-api-2020-5886a3310333.herokuapp.com/api",
    apiKey: "",
    targetId: "factsheet-detail-widget",
    factsheetId: null,
  };

  function loadCSS() {
    if (document.getElementById("factsheet-detail-widget-css")) {
      return;
    }

    const link = document.createElement("link");
    link.id = "factsheet-detail-widget-css";
    link.rel = "stylesheet";
    link.type = "text/css";

    const scriptTag = document.querySelector('script[src*="factsheet-detail-widget.js"]');
    if (scriptTag && scriptTag.src) {
      const baseUrl = scriptTag.src.replace("factsheet-detail-widget.js", "");
      link.href = baseUrl + "factsheet-detail-widget.css";
    } else {
      link.href = "factsheet-detail-widget.css";
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

  function renderFactsheetDetail(factsheet, container) {
    const title = factsheet.title || "No title";
    const intro = factsheet.intro || "No introduction";
    const sections = factsheet.sections || [];
    const link = factsheet.link || "";
    const createdAt = factsheet.createdAt
      ? new Date(factsheet.createdAt).toLocaleDateString()
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

  const FactsheetDetailWidget = {
    config: {},
    targetElement: null,

    init: function (options) {
      this.config = Object.assign({}, defaults, options);

      if (!this.config.apiKey) {
        console.error("FactsheetDetailWidget: API key is required");
        return;
      }

      if (!this.config.factsheetId) {
        const urlParams = new URLSearchParams(window.location.search);
        this.config.factsheetId = urlParams.get("id");
      }

      if (!this.config.factsheetId) {
        console.error("FactsheetDetailWidget: Factsheet ID is required");
        const target = document.getElementById(this.config.targetId);
        if (target) {
          target.innerHTML = '<div class="error">Error: Factsheet ID not found. Please provide an ID in the URL (?id=...) or in the init options.</div>';
        }
        return;
      }

      this.targetElement = document.getElementById(this.config.targetId);
      if (!this.targetElement) {
        console.error(
          `FactsheetDetailWidget: Target element with id "${this.config.targetId}" not found`
        );
        return;
      }

      loadCSS();
      this.targetElement.classList.add("factsheet-detail-widget");
      this.render();
      this.fetchData();
    },

    render: function () {
      this.targetElement.innerHTML = `
        <div id="factsheet-detail-result" class="loading">
          Loading factsheet...
        </div>
      `;
    },

    fetchData: function () {
      const detailResult = document.getElementById("factsheet-detail-result");

      const id = this.config.factsheetId;
      const url = `${this.config.apiBaseUrl}/factsheets/${id}`;

      fetch(url, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            if (response.status === 404) {
              return fetch(`${this.config.apiBaseUrl}/factsheets`, {
                headers: {
                  Authorization: `Bearer ${this.config.apiKey}`,
                  "Content-Type": "application/json",
                },
              }).then((listResponse) => {
                if (!listResponse.ok) throw new Error(`HTTP error! status: ${listResponse.status}`);
                return listResponse.json();
              }).then((listData) => {
                if (!listData || !listData.data || !listData.data.factsheets) {
                  throw new Error("Unexpected response structure");
                }
                const factsheet = listData.data.factsheets.find(
                  (f) => (f._id || f.id) === id
                );
                if (!factsheet) {
                  throw new Error("Factsheet not found");
                }
                return { data: { factsheet } };
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
          const factsheet = data.data?.factsheet || data.data?.factsheets?.[0] || data;
          if (!factsheet) {
            detailResult.innerHTML = `
              <div class="error">Error: Factsheet not found</div>
            `;
            return;
          }

          renderFactsheetDetail(factsheet, detailResult);
        })
        .catch((error) => {
          console.error("Error fetching factsheet:", error);
          detailResult.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        });
    },
  };

  window.FactsheetDetailWidget = FactsheetDetailWidget;
})(window);

