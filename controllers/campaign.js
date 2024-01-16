import * as campaignModel from '../models/campaign.js'
import * as cache from '../utils/cache.js'

const CACHE_KEY = cache.getCampaignKey()

export const createCampaign = async (req, res) => {
  try {
    const { product_id: productId, story } = req.body
    const pictureUrl = `${req.file.filename}`

    await campaignModel.createCampaign(productId, story, pictureUrl)
    await cache.del(CACHE_KEY)

    res.status(201).json({ message: 'Create the campaign successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const getCampaigns = async (req, res) => {
  try {
    const cachedCampaigns = await cache.get(CACHE_KEY)
    if (cachedCampaigns) {
      const campaigns = JSON.parse(cachedCampaigns)
      return res.status(200).json({ data: campaigns })
    }

    const campaigns = await campaignModel.getCampaigns()
    const formattedCampaigns = campaigns.map((campaign) => ({
      ...campaign,
      picture: `${process.env.AWS_CDN_URL}/${campaign.picture}`
    }))
    await cache.set(cache.CAMPAIGN_CACHE, JSON.stringify(formattedCampaigns))
    res.status(200).json({ data: formattedCampaigns })
  } catch (err) {
    console.error(err.stack)
    if (err instanceof Error) {
      res.status(500).json({ errors: err.message })
      return
    }
    res.status(500).json({ errors: 'get campaigns failed' })
  }
}
