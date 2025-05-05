import Subscription from "../models/subscriptionPlan.model.js"



const createSubscriptionPlan = async (req, res) => {

    const {price, name} = req.body

    try {

        const subscriptionPlan = new Subscription({
            name,
            price,
            status: 'active'
        })

        await subscriptionPlan.save()
        
        res.status(201).json({
            success: true,
            message: 'Subscription plan created successfully',
            data: subscriptionPlan
        })

        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error in creating plan',
        })
    }



}

export {createSubscriptionPlan};