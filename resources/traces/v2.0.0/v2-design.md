- Intrinsic primitives
- Pivot (defines center-point)
  x, y, z, w (arbitrary parameters)
  scale: (required)

- More useful primitives

standard **color** attribute

**label**

- Not just text, but text rendered in nice looking bubble

**path**

For paths, lines, NOT polygons

Has directionality, can render arrowheads

**shape**

Polygon and bezier shapes

- Recommend flow style log

- $if, $for constructs

- Macros
- - Built in

palette (material colors standard palette)

e.g.

"deepOrange"

"primary" primary.main

"background" background.main

"text" text.primary

- - Custom

Persistence options

`persistence: persistent` (default)

`persistent` (default): Show permanently once this event is played
`event-only`: Only show on current event
`event-scoped`: Show as long as current event is child of unclosed event
`persistent-scoped`: Show as long as event is unclosed

Too complicated??

`persistence: persistent`
`persistence: transient`

`persistence: { $until: closing }` Persist until the closing event for the event has been reached.

Also what is definition of scoped

- Split document (enable loading multiple files)
- - renderer section
- - event match
- - (\*) any/main
- - (expanding, generating): only expanding and generating
- - example: labelled component

JSON fallback - array of objects - check type

Merge all objects together, concatenate traces together

- general changes
- Use consistent terminology - Alpha (transparency, opacity)

Consequent work

Allow detection of new version and then backwards compatibility through detection of tag (version 2.0.0)

Schema/validation/language server
Parser rewrite
Parser streaming

Updating some adapters

**Warning for external scripts when loading**
