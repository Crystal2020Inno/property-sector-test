# Newsletter & Factsheet Widget

An embeddable widget for displaying newsletters and factsheets from your API. This widget can be easily embedded on any website using jsDelivr CDN.

## Files

- `widget.js` - Main widget JavaScript file
- `widget.css` - Widget stylesheet
- `index.html` - Demo/example file for local testing

## Setup

1. Push this repository to GitHub
2. Create a release or use the main branch
3. Users can embed the widget using jsDelivr

## Embedding Instructions

### Basic Usage

Add the following code to your HTML page where you want the widget to appear:

```html
<!-- 1. Create a container div -->
<div id="newsletter-widget"></div>

<!-- 2. Load the widget JavaScript from jsDelivr -->
<script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/widget.js"></script>

<!-- 3. Initialize the widget -->
<script>
  NewsletterWidget.init({
    targetId: "newsletter-widget",
    apiKey: "your-api-key-here",
    apiBaseUrl: "https://content-api-2020-5886a3310333.herokuapp.com/api",
  });
</script>
```

### Configuration Options

The `NewsletterWidget.init()` function accepts the following options:

- `targetId` (string, required) - The ID of the HTML element where the widget will be rendered
- `apiKey` (string, required) - Your API key for authentication
- `apiBaseUrl` (string, optional) - Base URL for the API (defaults to the provided URL)
- `title` (string, optional) - Title to display at the top of the widget (default: "Newsletters & Factsheets")
- `showTitle` (boolean, optional) - Whether to show the title (default: true)

### Example with Custom Title

```html
<div id="my-newsletter-widget"></div>
<script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/widget.js"></script>
<script>
  NewsletterWidget.init({
    targetId: "my-newsletter-widget",
    apiKey: "your-api-key-here",
    title: "Latest Updates",
    showTitle: true,
  });
</script>
```

### Example Without Title

```html
<div id="newsletter-widget"></div>
<script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/widget.js"></script>
<script>
  NewsletterWidget.init({
    targetId: "newsletter-widget",
    apiKey: "your-api-key-here",
    showTitle: false,
  });
</script>
```

## jsDelivr URL Format

Replace the following in the script src:

- `YOUR_USERNAME` - Your GitHub username
- `YOUR_REPO` - Your repository name
- `main` - The branch name (or use a tag/version like `v1.0.0`)

Examples:

- `https://cdn.jsdelivr.net/gh/username/repo@main/widget.js`
- `https://cdn.jsdelivr.net/gh/username/repo@v1.0.0/widget.js`
- `https://cdn.jsdelivr.net/gh/username/repo@latest/widget.js`

## Local Testing

To test locally, simply open `index.html` in your browser. Make sure `widget.js` and `widget.css` are in the same directory.

## Features

- ✅ Responsive design
- ✅ Fetches newsletters and factsheets from API
- ✅ Error handling
- ✅ Loading states
- ✅ XSS protection (HTML escaping)
- ✅ Easy to embed
- ✅ No dependencies
- ✅ Works with jsDelivr CDN

## Browser Support

Works in all modern browsers that support:

- ES5 JavaScript
- Fetch API
- CSS Flexbox

## Security Note

⚠️ **Important**: The API key is exposed in the client-side code. Make sure your API has proper CORS settings and rate limiting. Consider using a public/read-only API key for this widget.
