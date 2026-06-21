---
name: Bob's Farming namespace
description: Correct namespace and item IDs for Bob's Farming BY bycat addon
---
The addon uses namespace twb_farm: (NOT bobs_farming:). Items are the crop items directly — no separate _seeds suffix items. Correct crop list: garlic, onion, rice, broccoli, cauliflower, chili, eggplant, leek, grape, pineapple. All referenced as twb_farm:<crop>.

**Why:** Earlier code used bobs_farming: namespace from a different/older version of the addon. The actual addon file confirms twb_farm: via garlic.block.json identifier "twb_farm:garlic".

**How to apply:** Any new FOOD_SELL_RATES, SEED_SHOP, or MERCHANT_STOCK_TEMPLATES entries for Bob's Farming must use twb_farm:<cropname> with no _seeds suffix.
