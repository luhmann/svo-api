#SVO-API

[![Build Status](https://travis-ci.org/luhmann/svo-api.svg?branch=master)](https://travis-ci.org/luhmann/svo-api)

#### Insert Demo Data
```json
curl -X POST -H "Content-Type: application/json" -H "Cache-Control: no-cache" -d '{
        "slug": "hungarian-goulash",
        "title": "Ungarisches Saft-Gulasch",
        "subtitle": "Ein leckerer Klassiker für die Massen, der Jung und Alt begeistert",
        "published": 1454258757,
        "category": "dinner",
        "author": {
          "name": "Peter Pan",
          "image": null
        },
        "duration": {
          "preparation": 2400,
          "cooking": 1200,
          "cooling": 600
        },
        "servings": 6,
        "calories": 320,
        "protein": 36,
        "fat": 15,
        "carbs": 6,
        "difficulty": 2,
        "images": [{
            "src": "_MG_0551.jpg",
            "credits": "Jan Florian Dietrich",
            "width": 1024,
            "height": 683
          }],
        "cover": {
            "src": "_MG_0559.jpg",
            "credits": "Jan Florian Dietrich",
            "width": 1024,
            "height": 683
        },
        "ingredients": [{
            "amount": 1,
            "unit": "kg",
            "label": "Rindfleisch, gewürfelt"
        }, {
            "amount": 250,
            "unit": "g",
            "label": "Zwiebeln"
        }, {
            "amount": 50,
            "unit": "g",
            "label": "Schweineschmalz"
        }, {
            "amount": 3,
            "unit": null,
            "label": "Knoblauchzehen"
        }, {
            "amount": 2,
            "unit": "Tl",
            "label": "scharfes geräuchertes Paprikapulver"
        }, {
            "amount": null,
            "unit": null,
            "label": "Salz"
        }, {
            "amount": 1,
            "unit": "Tl",
            "label": "Kümmel"
        }, {
            "amount": 5,
            "unit": "El",
            "label": "Tomatenmark"
        }, {
            "amount": 200,
            "unit": "ml",
            "label": "trockener Rotwein"
        }, {
            "amount": 3,
            "unit": null,
            "label": "rote Paprikaschoten (à 200g)"
        }, {
            "amount": null,
            "unit": null,
            "label": "Zucker"
        }],
        "preparation": [{
            "step": 1,
            "description": "Das Fleisch in 4 cm große Stücke schneiden. Zwiebeln grob in Würfel schneiden. Zwiebeln bei mittlerer Hitze glasig dünsten. Knoblauch fein hacken und kurz mitdünsten.",
            "ingredients": [
              {
                "amount": 1,
                "unit": "kg",
                "label": "Rindfleisch"
              },
              {
                "amount": 1,
                "unit": null,
                "label": "Zwiebel"
              },
              {
                "amount": 1,
                "unit": "Zehe",
                "label": "Knoblauch"
              }
            ],
            "utensils": [
              "Messer",
              "Schneidebrett"
            ],
            "images": [
              {
                "src": "_IMG_0574.jpg"
              }
            ]
        }, {
            "step": 2,
            "description": "Paprikapulver kurz mitbraten. Fleisch zugeben und bei mittlerer Hitze 7 Minuten braten. Mit Salz, Pfeffer und Kümmel würzen. Das Tomatenmark mit 250 ml Wasser und Rotwein verrühren. Zum Fleisch geben, zugedeckt aufkochen. Bei milder Hitze 2:30 Stunden schmoren."
        }, {
            "step": 3,
            "description": "Paprikaschoten putzen, entkernen und in große Stücke schneiden. Danach unter das Fleisch mischen und weitere 40 Minuten schmoren. Am Ende mit Salz, Pfeffer und Paprikapulver abschmecken"
        }, {
            "step": 4,
            "description": "Experimentieren Sie mit verschiedenen Paprikasorten",
            "type": "hint"
        }],
        "quickinfo": {
            "skinny": false,
            "glutenFree": false,
            "restTime": true,
            "vegetarian": false
        },
        "utensils": [
          "Messer",
          "Schneidebrett",
          "großer Topf",
          "Kochlöffel"
        ],
        "wine": "Zum Gulasch reicht man traditionell einen schweren Rotwein wie z.B. einen Cabernet Sauvignon",
        "dessert": "Wer nach so viel herzhaftem Essen noch Lust auf was Süßes hat, reicht dazu unseren [Kaiserschmarren mit Limettensauce](/demo/foo)"
    }' "http://localhost:3030/api/v1/recipes"
```
