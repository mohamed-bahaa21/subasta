// GET /api/public/generals
const express = require("express");
const router = express.Router();
// Controller
const { getLegalPage, getFaqPage, postSubscribeToNewsletter, postContactUs } = require('@controllers/public/generals.public.controller')
// Validatior
const { ParamsValidation, QueryValidation, BodyValidation } = require("@validators/index.validator");
const validationSchemes = require('@validators/public.validators')

// GET legal pages content (privacy, terms, etc) for a specific language (en, es, er, fr)
router.get("/:lang/:page", QueryValidation(validationSchemes.generalsValidationSchemas["/:lang/:page"]), getLegalPage);
// GET FAQ page for a specific language (en, es, er, fr)
router.get("/:lang/faq", QueryValidation(validationSchemes.generalsValidationSchemas['/:lang/faq']), getFaqPage);

// ===========================================================================

// POST subscribe to the newsletter.
router.post("/subscribe-to-newsletter", postSubscribeToNewsletter);
// POST contact us form (TBD the email & SMS provider).
router.post("/contact-us", BodyValidation(validationSchemes.generalsValidationSchemas["/contact-us"]), postContactUs);



module.exports = router;
