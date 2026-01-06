/**
 * Factsheet List Widget
 * Shows factsheet titles, dates, and "Read more" buttons
 *
 * Usage:
 * <div id="factsheet-list-widget"></div>
 * <script src="https://cdn.jsdelivr.net/gh/username/repo@main/factsheet-list-widget.js"></script>
 * <script>
 *   FactsheetListWidget.init({
 *     targetId: 'factsheet-list-widget',
 *     apiKey: 'your-api-key',
 *     apiBaseUrl: 'https://content-api-2020-5886a3310333.herokuapp.com/api',
 *     detailPageUrl: 'factsheet-detail.html' // URL to detail page
 *   });
 * </script>
 */

(function (window) {
  "use strict";

  const defaults = {
    apiBaseUrl: "https://content-api-2020-5886a3310333.herokuapp.com/api",
    apiKey: "",
    targetId: "factsheet-list-widget",
    title: "Factsheets",
    showTitle: true,
    detailPageUrl: "factsheet-detail.html",
  };

  function loadCSS() {
    if (document.getElementById("factsheet-list-widget-css")) {
      return;
    }

    const link = document.createElement("link");
    link.id = "factsheet-list-widget-css";
    link.rel = "stylesheet";
    link.type = "text/css";

    const scriptTag = document.querySelector('script[src*="factsheet-list-widget.js"]');
    if (scriptTag && scriptTag.src) {
      const baseUrl = scriptTag.src.replace("factsheet-list-widget.js", "");
      link.href = baseUrl + "factsheet-list-widget.css";
    } else {
      link.href = "factsheet-list-widget.css";
    }

    document.head.appendChild(link);
  }

  function escapeHtml(text) {
    if (typeof text !== "string") return text;
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function getFactsheetId(factsheet) {
    return factsheet._id || factsheet.id || "";
  }

  function renderFactsheetList(factsheets, container, detailPageUrl) {
    if (!factsheets || factsheets.length === 0) {
      container.innerHTML = '<p class="empty">No factsheets found</p>';
      return;
    }

    let html = "";
    factsheets.forEach((factsheet) => {
      const title = factsheet.title || "No title";
      const createdAt = factsheet.createdAt
        ? new Date(factsheet.createdAt).toLocaleDateString()
        : "";
      const id = getFactsheetId(factsheet);
      const detailUrl = detailPageUrl + (detailPageUrl.includes("?") ? "&" : "?") + "id=" + encodeURIComponent(id);

      html += `
        <div class="list-item">
          <div class="list-item-content">
            <h3>${escapeHtml(title)}</h3>
            ${createdAt ? `<p class="list-item-date">${createdAt}</p>` : ""}
          </div>
          <a href="${escapeHtml(detailUrl)}" class="read-more-btn">Read more</a>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  const FactsheetListWidget = {
    config: {},
    targetElement: null,

    init: function (options) {
      this.config = Object.assign({}, defaults, options);

      if (!this.config.apiKey) {
        console.error("FactsheetListWidget: API key is required");
        return;
      }

      this.targetElement = document.getElementById(this.config.targetId);
      if (!this.targetElement) {
        console.error(
          `FactsheetListWidget: Target element with id "${this.config.targetId}" not found`
        );
        return;
      }

      loadCSS();
      this.targetElement.classList.add("factsheet-list-widget");
      this.render();
      this.fetchData();
    },

    render: function () {
      const titleHTML = this.config.showTitle
        ? `<h1>${escapeHtml(this.config.title)}</h1>`
        : "";

      this.targetElement.innerHTML = `
        ${titleHTML}
        <div class="list-container">
          <div id="factsheet-list-result" class="loading">
            Loading factsheets...
          </div>
        </div>
      `;
    },

    fetchData: function () {
      const listResult = document.getElementById("factsheet-list-result");

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
          if (!data || !data.data || !data.data.factsheets) {
            listResult.innerHTML = `
              <div class="error">Error: Unexpected response structure</div>
              <pre>${JSON.stringify(data, null, 2)}</pre>
            `;
            return;
          }

          const factsheets = data.data.factsheets;
          renderFactsheetList(factsheets, listResult, this.config.detailPageUrl);
        })
        .catch((error) => {
          console.error("Error fetching factsheets:", error);
          listResult.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        });
    },
  };

  window.FactsheetListWidget = FactsheetListWidget;
})(window);

