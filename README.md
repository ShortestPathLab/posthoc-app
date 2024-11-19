![image](https://github.com/ShortestPathLab/posthoc-app/assets/15244945/7ed341b8-1415-4572-9103-5d103bdd7835)

Hey researchers, developers and problem-solvers!

**Posthoc** is a way to build simple and effective visualisations ✨ for sequential decision-making algorithms, like search. If you're looking for a quick way to analyse, debug or understand your algorithm, give Posthoc a try!

![Alt text](./client/src/public/screenshots/0.png)

Here's how it works:

1. Print logs as [search traces](https://posthoc.pathfinding.ai/docs/search-trace)
2. Drop those into the [Posthoc visualiser](https://posthoc.pathfinding.ai/docs/category/posthoc-visualiser)
3. Voila!

Interested? [Get started here](https://posthoc.pathfinding.ai).

## Documentation

[View documentation](https://posthoc.pathfinding.ai)

## Changelog

[View changelog](./docs/changelog.md)

## Releases

[View releases](https://github.com/ShortestPathLab/posthoc-app/releases)

## Contributing

### Setting up a local development environment

#### Install Bun

This project uses [Bun](https://bun.sh) instead of NodeJS.

Set up Bun with:

```bash
curl -fsSL https://bun.sh/install | bash
```

### Clone the repo

Clone the repo with:

```bash
git clone https://github.com/ShortestPathLab/posthoc-app.git
cd posthoc-app
```

### Install dependencies

Make sure run `bun i` in the root directory instead of any sub-folders.

```bash
bun i
```

### Start the dev server

```bash
cd client
bun start
```
