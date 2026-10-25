/**
 * English is the source of truth. Every other language is a partial copy of
 * this object; a key missing from a translation falls back to the English text
 * here, so adding a string never breaks a language, it just shows in English
 * until translated.
 *
 * Placeholders use {name}. Keep them intact when translating.
 */
export const en = {
  /* navigation */
  "nav.home": "BreedVision — home",
  "nav.primary": "Primary",
  "nav.breeds": "Breeds",
  "nav.history": "History",
  "nav.prices": "Prices",
  "nav.account": "Account",
  "nav.identify": "Identify an animal",
  "nav.openMenu": "Open menu",
  "nav.closeMenu": "Close menu",
  "lang.label": "Language",

  /* footer */
  "footer.tagline": "Image-based breed identification for Indian cattle.",
  "footer.product": "Product",
  "footer.breedLibrary": "Breed library",
  "footer.disclaimer":
    "BreedVision — a prototype system. Predictions are advisory and should be confirmed by a qualified assessor.",
  "footer.prototype": "Research prototype",

  /* home */
  "visual.photo": "Animal photo",
  "home.title": "Identify the breed. Keep a record that holds up.",
  "home.lead":
    "Image-based breed identification for Indian cattle. Photograph an animal and get a predicted breed, a confidence score, and the alternatives worth considering.",
  "home.exploreBreeds": "Explore breeds",
  "home.note":
    "A research prototype. Predictions are advisory and are meant to support a qualified assessor, not replace one.",
  "home.problem.eyebrow": "The problem",
  "home.problem.title":
    "Identifying a breed by eye is harder to standardise than it looks",
  "home.problem.desc":
    "Breed identification underpins livestock records, breeding decisions and scheme eligibility. In practice it is done visually, in the field, under time pressure.",
  "home.problem.1.title": "It depends on who is looking",
  "home.problem.1.body":
    "Breed assessment in the field rests on individual experience. Two assessors can reach two conclusions about the same animal.",
  "home.problem.2.title": "Expertise is not evenly available",
  "home.problem.2.body":
    "The people best able to identify a breed are not always the people standing in front of the animal.",
  "home.problem.3.title": "Records are hard to standardise",
  "home.problem.3.body":
    "Without a consistent method, breed data collected across districts is difficult to compare or aggregate.",
  "home.how.eyebrow": "How it works",
  "home.how.title": "Four steps, start to record",
  "home.step.1.title": "Capture",
  "home.step.1.body":
    "Photograph the animal on a phone, or upload an image you already have.",
  "home.step.2.title": "Analyse",
  "home.step.2.body": "The image is resized and passed to a computer-vision model.",
  "home.step.3.title": "Identify",
  "home.step.3.body": "The model returns a predicted breed and how confident it is.",
  "home.step.4.title": "Record",
  "home.step.4.body":
    "Keep the result, with time and optional location, as a record.",
  "home.result.eyebrow": "The result",
  "home.result.title": "An answer you can weigh, not just accept",
  "home.result.desc":
    "Every identification states how confident the model is. When it is not confident, it says so rather than presenting a guess as a finding.",
  "home.result.1.t": "Confidence is always visible",
  "home.result.1.d":
    "Shown as a written status, a meter and a number — never colour alone.",
  "home.result.2.t": "Alternatives are shown",
  "home.result.2.d":
    "The next most likely breeds, so a knowledgeable user can apply judgement.",
  "home.result.3.t": "Uncertainty is stated plainly",
  "home.result.3.d":
    "Below the threshold, the result is “identification uncertain”, not a breed name.",
  "home.cta.title": "Try it on a photo",
  "home.cta.body": "No account needed to run an identification.",

  /* identify page and flow */
  "identify.title": "Identify an animal",
  "identify.intro":
    "One clear photo is enough. You will see the predicted breed, how confident the model is, and the next most likely alternatives.",
  "flow.guide.title": "What makes a good photo",
  "flow.guide.1": "Show most of the animal, not just the head",
  "flow.guide.2": "Photograph from the side where possible",
  "flow.guide.3": "Use daylight and avoid deep shade",
  "flow.guide.4": "Keep the animal unobstructed",
  "flow.drop.title": "Add a photo of the animal",
  "flow.drop.body": "Take a new photo or choose one from this device.",
  "flow.takePhoto": "Take photo",
  "flow.upload": "Upload image",
  "flow.limits": "JPG, PNG or WEBP · up to {mb} MB",
  "flow.failTitle": "That photo could not be used",
  "flow.chooseAnother": "Choose another photo",
  "flow.preparing": "Preparing image",
  "flow.preparing.body": "Resizing the photo for upload.",
  "flow.analysing": "Analysing image",
  "flow.analysing.body": "Comparing the animal against known breeds.",
  "flow.previewAlt": "Preview of the photo you selected",
  "flow.reducedFrom": "reduced from {size}",
  "flow.change": "Change photo",
  "flow.analyse": "Analyse breed",
  "flow.mockWhat": "This prediction was generated for interface development.",
  "flow.imgAlt": "The animal you submitted for identification",
  "flow.recorded": "Recorded",
  "flow.modelVersion": "Model version",
  "flow.location": "Location",
  "flow.notCaptured": "Not captured",
  "flow.analysisTime": "Analysis time",
  "flow.attachLoc": "Attach my location to this record",
  "flow.attachLoc.hint": "Optional. Asked for only when you press Save.",
  "flow.save": "Save record",
  "flow.saving": "Saving…",
  "flow.viewSaved": "View saved record",
  "flow.another": "Identify another",
  "flow.viewBreed": "View breed",
  "flow.savedOnDevice": "Saved on this device.",
  "flow.locAttached": "Location attached.",
  "flow.synced": "Synced to your account.",
  "flow.syncFailed":
    "Cloud sync didn’t finish. It will retry from the Account page.",
  "flow.saveFailed": "This record could not be saved on your device.",
  "flow.localOnly":
    "Records are stored on this device only. There is no account or server yet, so nothing is uploaded.",

  /* prediction result */
  "pred.predicted": "Predicted breed",
  "pred.other": "Other possibilities",
  "pred.possible": "Possible matches",
  "pred.noneConfirmed": "Listed most to least likely. None is confirmed.",
  "pred.uncertainTitle": "This animal could not be matched to one breed",
  "pred.lowTitle": "The breed could not be determined",
  "pred.helps.title": "What usually helps",
  "pred.helps.1": "Stand back so most of the animal is in frame.",
  "pred.helps.2": "Photograph from the side rather than head-on.",
  "pred.helps.3": "Avoid strong backlight and deep shade.",
  "pred.helps.4": "Make sure the animal is not blocked by fencing or people.",
  "band.confident.label": "Confident match",
  "band.confident.desc": "The model identified one breed clearly.",
  "band.uncertain.label": "Identification uncertain",
  "band.uncertain.desc":
    "The model could not settle on one breed. Review the candidates below.",
  "band.low.label": "Could not identify",
  "band.low.desc":
    "The model could not determine the breed from this image. A clearer photo of the whole animal usually helps.",

  /* duplicate-photo notices */
  "dup.same": "This looks like the same photo as one you saved on {date}.",
  "dup.similar": "This photo is very similar to one you saved on {date}.",
  "dup.view": "View that record",
  "dup.caveat":
    "This compares pictures only. It cannot tell whether two different photos show the same animal, and it can miss heavily cropped or rotated copies. You can still save this record.",
  "dup.remote.same": "This looks like a photo already recorded",
  "dup.remote.similar": "A very similar photo is already recorded",
  "dup.remote.own": "on your account.",
  "dup.remote.shared": "in the shared system.",
  "dup.remote.caveat":
    "This compares pictures only. It cannot tell whether two different photos show the same animal, and it can miss cropped or rotated copies. You can still save this record.",

  /* demo-data notice */
  "mock.label": "Demonstration data.",
  "mock.tail":
    "No breed model has been trained yet, so nothing here is a real identification.",

  /* heat-map panel */
  "heat.unavailable":
    "The “where the model looked” view is available when the app is connected to the live model.",
  "heat.show": "Show where the model looked",
  "heat.working": "Working out where the model found evidence…",
  "heat.darker":
    "Darker areas are where the model found more evidence for this breed.",
  "heat.toggle": "Show heat-map over the photo",
  "heat.note":
    "The model sees only the centre of the photo, so this is that square, not the whole image. This shows regions that influenced the result. It does not show which body features the model used, and it is not proof of how the breed was recognised.",
  "heat.limits": "Limits of this view",
} as const;

export type MessageKey = keyof typeof en;
