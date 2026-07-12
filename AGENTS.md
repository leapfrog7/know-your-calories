# AGENTS.md

## Project

This project is **Know Your Calories**, a mobile-first calorie and macro tracking app focused on Indian foods, packaged foods, and simple daily meal logging.

The app is built with:

- React
- Vite
- Tailwind CSS
- LocalStorage
- GitHub Pages deployment

There is currently no backend. Do not introduce a backend unless specifically requested.

## Core Product Direction

This is a **mobile-first calorie tracker**. Every UI decision must prioritize:

- Small screen usability
- Touch-friendly controls
- Compact cards
- Clear visual hierarchy
- Fast food logging
- Low friction meal entry

The main user flows are:

1. Today’s meal logging
2. Add food
3. Quick add / Favorites
4. Meal planning for future dates
5. Summary
6. History
7. Settings / backup / restore

## Important Design Rules

Use a clean, modern, mobile-first visual language.

Current visual identity:

- Today / actual intake: emerald, green, slate
- Planning / future meals: indigo, sky, blue
- Calories: amber or green depending on context
- Protein: emerald / indigo
- Carbs: sky
- Fat: amber
- Delete/destructive actions: rose

Avoid heavy desktop layouts.

Avoid large tables on mobile.

Use rounded cards, compact badges, and clear action buttons.

## Nutrition Model

The app follows a **per-100g nutrition model** for most foods.

Important rule:

- Food data should generally store nutrition per 100g.
- User quantity should usually be controlled through grams or serving portions.
- The UI should avoid vague small/medium/large serving labels as the primary quantity method.
- For cooked rice, the preferred default quantity is 150g.
- If INDB provides a standard serving or unit serving, the card and selected panel should show the same serving-based calories/macros used in calculation.

Avoid confusing users by showing one calorie value on the card and another after selection.

## Food Sources

Current intended sources:

- INDB / Indian Nutrient Databank style Indian food data
- Open Food Facts / packaged foods
- Custom user-created foods
- Local packaged fallback data

Do not remove or simplify source fields unless asked.

Important fields that may exist on food objects:

- id
- name
- shortName
- source
- foodType
- category
- cuisine
- brand
- barcode
- imageUrl
- caloriesPer100g
- proteinPer100g
- carbsPer100g
- fatPer100g
- freeSugarPer100g
- portions
- defaultServing
- unitServing
- aliases
- notes

## Storage Model

This app is local-first. User data is stored in browser localStorage.

Do not casually rename storage keys.

Current important keys:

```js
kyc_daily_log_v1;
kyc_favorite_food_ids_v1;
```
