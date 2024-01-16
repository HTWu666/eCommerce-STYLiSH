const adminPage = (req, res, next) => {
  try {
    const { category } = req.params

    if (category === 'product') {
      res.status(200).render('./admin/adminProduct', { layout: false })
    } else if (category === 'campaign') {
      res.status(200).render('./admin/adminCampaign', { layout: false })
    } else if (category === 'checkout') {
      res.status(200).render('./admin/adminCheckout', { layout: false })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export default adminPage
