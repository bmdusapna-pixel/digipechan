# Local Development Setup Guide

## Environment Configuration

To run the application locally, you need to create a `.env.local` file in the `client` directory.

### Steps:

1. Create a file named `.env.local` in the `client` directory
2. Add the following content (adjust the port if your backend runs on a different port):

```env
# Backend API Base URL for local development
# Update the port number (5000) to match your backend server port
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:5000/api
```

### Finding Your Backend Port

The backend server port is typically defined in your server's `.env` file. Common ports are:
- `5000`
- `8000`
- `3001`
- `4000`

Check your server's `.env` file for the `PORT` variable, or look at the console output when you start the backend server.

### Important Notes

- The `.env.local` file is gitignored and won't be committed to the repository
- Make sure your backend server is running before starting the frontend
- In development mode, the backend uses `/api` prefix for routes
- After creating/updating `.env.local`, restart your Next.js dev server

## Troubleshooting

### 403 Forbidden Error
- Ensure your backend server is running
- Check that the port in `.env.local` matches your backend server port
- Verify CORS is configured correctly on the backend (localhost should be allowed)

### 404 Errors
- Make sure the backend server is running on the correct port
- Check that the API endpoint path includes `/api` prefix in development mode

