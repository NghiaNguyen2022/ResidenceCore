# Organization modal viewport + smooth return v2

## Fixed
- Unit members modal no longer uses vertical centering; overlay itself scrolls.
- Header is sticky and modal body starts below it, so top controls are not covered.
- First "Chọn Tổ/Ban" section has extra bottom spacing and visible overflow to prevent the next panel from covering the select.
- Return to Members uses Wouter SPA navigation instead of `window.location.assign`, reducing full-page reload/jitter.
- After add/transfer success, return waits 160ms so the UI does not flicker abruptly.
- Members page still reopens the same member detail directly on the `Tổ chức` tab.

## Protected
- OrgChart untouched.
- Appointment validation untouched.
- Tổ/Ban rules untouched.
