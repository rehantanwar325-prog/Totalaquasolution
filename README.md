# Total Aqua Solution

Water purifier storefront for **Total Aqua Solution** - product catalogue with filters, WhatsApp service booking, and an admin dashboard for products and shop settings.

## Tech stack

- HTML, CSS and vanilla JavaScript
- Supabase for products, settings and admin authentication
- Schema in `supabase_setup.sql`

## Structure

```
index.html                        storefront
admin.html, admin.js, admin.css   admin dashboard
app.js, style.css                 storefront logic and styles
supabase_setup.sql                tables and policies
.github/                          workflows
```

## Getting started

1. Create a Supabase project and run `supabase_setup.sql`.
2. Add the project URL and anon key to the app configuration.
3. Serve the folder locally, for example `npx serve .`.

## Author

Rehan Tanwar
