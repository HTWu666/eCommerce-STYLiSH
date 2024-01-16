import express from 'express'
import { createCampaign, getCampaigns } from '../controllers/campaign.js'
import { imgUpload } from '../middlewares/campaignImgUpload.js'
import validCreateCampaign from '../middlewares/validCreateCampaign.js'

const router = express.Router()

router.post('/marketing/campaigns', imgUpload, validCreateCampaign, createCampaign)
router.get('/marketing/campaigns', getCampaigns)

export default router
