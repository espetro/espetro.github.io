# Development guidelines

- Use `pnpm` as task and package manager
- Run `pnpm works:new` to scaffold work entries; `pnpm refresh:repos` and `pnpm refresh:contributions` update cached GitHub data.

## Writing content

- Log entry ids (file/folder names in `content/blog`) are immutable once published: they are the Giscus discussion term (`data-mapping="specific"`) and the `/log/[id]` URL. `/posts/*` redirects to `/log/*` via `public/_redirects`; never remove those redirects.
- When adding an image, verify if it has an optimal publishing size with `sharp`.
