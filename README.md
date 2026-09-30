# North Harris AI Task Force dashboard

Static HTML, CSS, and vanilla JavaScript dashboard built from the Google Doc **AI in Education & Workplace - North Harris Working Session**.

## Run locally

Open `index.html` for a browser-only preview. Contributions and artifacts are saved in the current browser with `localStorage`.

For the shared multi-user version, deploy this folder to Netlify. Netlify will expose the two functions in `netlify/functions/` and the `/api/state` and `/api/file` routes defined in `netlify.toml`. The deployed version uses Netlify Blobs for the shared dashboard state and uploaded files.

## Included

- Day and night theme toggle.
- Overview of the three breakout tables and live contribution counts.
- Presentation-style PRIMER section with slide controls, keyboard navigation, and presentation mode.
- Shared contribution forms for curriculum, workplace, and training / follow-up tables.
- Action board based on the source document's closing next steps.
- Text artifact creator for Markdown, plain text, and Word-compatible `.doc` files.
- File upload support for supporting files up to 5 MB.
- Google Doc / source-link saving.
- Browser Print / PDF flow with print CSS.
