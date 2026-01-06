# Newsletter Widget

Embeddable widget for displaying newsletters from your API. The widget can be easily embedded on any website using jsDelivr CDN.

## Widget Types

### 1. List Widget (Summary View)

Shows newsletter titles, dates, and "Read more" buttons. Perfect for listing pages.

- **Newsletter List Widget**: `newsletter-list-widget.js` + `newsletter-list-widget.css`

### 2. Detail Widget (Full Content)

Shows complete newsletter content by ID. Perfect for detail pages.

- **Newsletter Detail Widget**: `newsletter-detail-widget.js` + `newsletter-detail-widget.css`

## Files

- `newsletter-list-widget.js` - Newsletter list widget JavaScript file
- `newsletter-list-widget.css` - Newsletter list widget stylesheet
- `newsletter-detail-widget.js` - Newsletter detail widget JavaScript file
- `newsletter-detail-widget.css` - Newsletter detail widget stylesheet

## Setup

1. Push this repository to GitHub
2. Create a release or use the main branch
3. Users can embed the widget using jsDelivr

## Embedding Instructions

### List + Detail Widget Pattern (Recommended)

This pattern shows a summary list with "Read more" buttons that link to detail pages. Perfect for better user experience and page performance.

#### Step 1: Create a List Page

Embed the list widget on your listing page:

```html
<!-- Newsletter List Page -->
<div id="newsletter-list-widget"></div>
<script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/newsletter-list-widget.js"></script>
<script>
  NewsletterListWidget.init({
    targetId: "newsletter-list-widget",
    apiKey: "your-api-key-here",
    apiBaseUrl: "https://content-api-2020-5886a3310333.herokuapp.com/api",
    detailPageUrl: "newsletter-detail.html", // URL to your detail page
    title: "Newsletters",
    showTitle: true,
  });
</script>
```

#### Step 2: Create a Detail Page

Embed the detail widget on your detail page. The ID is automatically read from the URL parameter:

```html
<!-- Newsletter Detail Page (newsletter-detail.html) -->
<div id="newsletter-detail-widget"></div>
<script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/newsletter-detail-widget.js"></script>
<script>
  NewsletterDetailWidget.init({
    targetId: "newsletter-detail-widget",
    apiKey: "your-api-key-here",
    apiBaseUrl: "https://content-api-2020-5886a3310333.herokuapp.com/api",
    // newsletterId is automatically read from URL ?id= parameter
  });
</script>
```

When users click "Read more", they'll be taken to `newsletter-detail.html?id=123` and the detail widget will automatically load that newsletter.

## Configuration Options

### NewsletterListWidget.init() Options

- `targetId` (string, required) - The ID of the HTML element where the widget will be rendered
- `apiKey` (string, required) - Your API key for authentication
- `apiBaseUrl` (string, optional) - Base URL for the API (defaults to the provided URL)
- `title` (string, optional) - Title to display at the top of the widget (default: "Newsletters")
- `showTitle` (boolean, optional) - Whether to show the title (default: true)
- `detailPageUrl` (string, required) - URL to the detail page where users will be redirected when clicking "Read more"

### NewsletterDetailWidget.init() Options

- `targetId` (string, required) - The ID of the HTML element where the widget will be rendered
- `apiKey` (string, required) - Your API key for authentication
- `apiBaseUrl` (string, optional) - Base URL for the API (defaults to the provided URL)
- `newsletterId` (string, optional) - The ID of the newsletter to display. If not provided, it will be read from the URL parameter `?id=...`

## Examples

### Newsletter List Widget

```html
<div id="newsletter-list-widget"></div>
<script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/newsletter-list-widget.js"></script>
<script>
  NewsletterListWidget.init({
    targetId: "newsletter-list-widget",
    apiKey: "your-api-key-here",
    detailPageUrl: "newsletter-detail.html",
    title: "Latest Newsletters",
    showTitle: true,
  });
</script>
```

### Newsletter Detail Widget

```html
<div id="newsletter-detail-widget"></div>
<script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/newsletter-detail-widget.js"></script>
<script>
  NewsletterDetailWidget.init({
    targetId: "newsletter-detail-widget",
    apiKey: "your-api-key-here",
    // ID automatically read from URL ?id= parameter
  });
</script>
```

## jsDelivr URL Format

Replace the following in the script src:

- `YOUR_USERNAME` - Your GitHub username
- `YOUR_REPO` - Your repository name
- `main` - The branch name (or use a tag/version like `v1.0.0`)

Examples:

- `https://cdn.jsdelivr.net/gh/username/repo@main/newsletter-list-widget.js`
- `https://cdn.jsdelivr.net/gh/username/repo@main/newsletter-detail-widget.js`
- `https://cdn.jsdelivr.net/gh/username/repo@v1.0.0/newsletter-list-widget.js`

## Local Testing

To test locally, you can create HTML files that reference the widget files:

**List Page:**
```html
<div id="newsletter-list-widget"></div>
<script src="newsletter-list-widget.js"></script>
<script>
  NewsletterListWidget.init({
    targetId: "newsletter-list-widget",
    apiKey: "your-api-key",
    apiBaseUrl: "https://content-api-2020-5886a3310333.herokuapp.com/api",
    detailPageUrl: "newsletter-detail.html",
  });
</script>
```

**Detail Page:**
```html
<div id="newsletter-detail-widget"></div>
<script src="newsletter-detail-widget.js"></script>
<script>
  NewsletterDetailWidget.init({
    targetId: "newsletter-detail-widget",
    apiKey: "your-api-key",
    apiBaseUrl: "https://content-api-2020-5886a3310333.herokuapp.com/api",
  });
</script>
```

## Features

- ✅ **List and Detail widgets** - Separate widgets for listing and detail pages
- ✅ **Responsive design** - 2-column grid on desktop, 1 column on mobile
- ✅ **Automatic CSS loading** - CSS loads automatically from the same CDN location
- ✅ **Error handling** - Graceful error messages for API failures
- ✅ **Loading states** - Shows loading indicators while fetching data
- ✅ **XSS protection** - All user content is HTML-escaped, safe HTML is sanitized
- ✅ **HTML rendering** - Content from API renders properly with safe HTML tags
- ✅ **Easy to embed** - Simple script tag integration
- ✅ **No dependencies** - Pure vanilla JavaScript
- ✅ **Works with jsDelivr CDN** - Fast global CDN delivery

## Browser Support

Works in all modern browsers that support:

- ES5 JavaScript
- Fetch API
- CSS Grid and Flexbox

## Security Note

⚠️ **Important**: The API key is exposed in the client-side code. Make sure your API has proper CORS settings and rate limiting. Consider using a public/read-only API key for this widget.
