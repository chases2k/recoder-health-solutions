# Recoder Health Solutions · Karla Hernandez

A fast, single-page marketing site for Karla Hernandez (licensed health insurance advisor, NPN 21039849).
Plain HTML, CSS and a little JavaScript: **no build step, no dependencies.**

```
index.html       the site
privacy.html     privacy policy (linked from the footer)
styles.css       all styling (brand colours are the variables at the top)
script.js        menu, scroll effects, tabs, Calendly loader, contact form
assets/          logo, bull mark, portrait, favicons, social-share image
robots.txt  sitemap.xml
```

## See it locally

```bash
python -m http.server 8812
```

Then open http://localhost:8812. (Any static server works; opening `index.html` directly also works, but the
Calendly calendar needs `http://`.)

## Put it on recoderhealthsolutions.com

Any static host works and the free tiers are plenty. Easiest options:

1. **Cloudflare Pages / Netlify**: drag-and-drop this folder, then add `recoderhealthsolutions.com` under
   *Custom domains* and follow the DNS instructions.
2. **GitHub Pages**: push this folder to a repo, enable Pages, add a `CNAME` file containing
   `recoderhealthsolutions.com`, and point the domain's DNS at GitHub.

After it is live: open <https://recoderhealthsolutions.com> and check that the share image appears when you paste
the link into a text or Facebook post.

## Google

- **Google Search Console**: add the domain, then submit `https://recoderhealthsolutions.com/sitemap.xml`.
  The page already has a title, description, social tags and `InsuranceAgency` structured data.
- **Google Business Profile**: use `https://recoderhealthsolutions.com` as the website. A business address (or
  service area) on the profile is what lets Google show her in local results. Once Karla has her review link, add a
  "Leave a Google review" link in the Contact section (there is a commented-out spot in `index.html`).
- **Analytics** (optional): paste the Google tag from Google Analytics into the `<head>` of `index.html`. If you add
  analytics, mention it in `privacy.html` (section 4).

## Contact form

The form works out of the box by opening a pre-filled email to recoderhealth@gmail.com. To have messages arrive in
her inbox directly instead, create a free form at [Formspree](https://formspree.io) (or similar) and paste its URL
into `FORM_ENDPOINT` at the top of `script.js`.

## Things Karla should confirm (draft copy)

- **About Karla** (section in `index.html`, marked `DRAFT COPY`): written from the business card and the services
  list. Swap in her own words or the bio she wrote earlier.
- **Services**: Medical, Small Business / Self-Employed, Life, Dental & Vision, Life Changes & Plan Reviews. Remove
  or add cards to match exactly what she sells.
- **"No fee for my guidance"** (hero, FAQ): standard for agents paid by carriers; confirm it matches how she is paid.
- **Enrollment dates**: the Marketplace card says only "Begins Nov 1" because end dates change by state and year.
  Add the current deadline once she confirms it.
- **Privacy policy**: adapted from the structure of Chasin' Coverage's policy; confirm it matches her practices.
- **Licensing**: the site claims only what is on her business card (licensed health insurance advisor, NPN
  21039849). Add the states she is licensed in if she wants them shown.

## Editing

- Colours: the `:root` variables at the top of `styles.css` (`--green`, `--gold`, ...).
- The announcement bar at the very top changes automatically with the calendar (see `script.js`).
- Calendly: the scheduler is `https://calendly.com/recoderhealth`; change the `data-url` on `#calendlyWidget` and the
  links in `index.html` if the link ever changes.
