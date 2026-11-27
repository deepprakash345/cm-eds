# Star Rating

An interactive star-rating widget that extends the OOTB `number-input` field. Users click (or use arrow keys) to pick a rating; the numeric value is stored in the form model. Half-star ratings are supported when enabled.

## How to Use

Add a **Star Rating** field to your form and configure it through the properties below.

## Authoring Properties

| Property | Description | Default |
|----------|-------------|---------|
| Maximum number of stars (`maxStars`) | How many stars to render | 5 |
| Allow half-star ratings (`allowHalf`) | When `Yes`, clicking the left half of a star records a `.5` value | No |
| Default Value (`default`) | Pre-selected rating | — |

It also inherits the standard number-input validation and help properties.

## Model Subscriptions

Subscribes via `subscribe(..., { listenChanges: true })` and reacts to `value` changes so a rule that sets the value re-paints the stars.

## Model Properties Set

Writes `model.value` (the numeric rating) immediately when the user clicks a star or changes it with the keyboard. Change rules on the field fire once per selection.

## Usage Notes

- Base type: `number-input` (`core/fd/components/form/numberinput/v1/numberinput`).
- `fd:viewType`: `star-rating`.
- Keyboard: Left/Down decreases, Right/Up increases (by 0.5 when half-stars are enabled).
