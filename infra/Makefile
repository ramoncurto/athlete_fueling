.PHONY: dev lint test seed

dev:
	npm run dev --workspace web

lint:
	npm run lint --workspace web

test:
	npm run test --workspace web || true

seed:
	npx ts-node ./scripts/dump-seed.ts
