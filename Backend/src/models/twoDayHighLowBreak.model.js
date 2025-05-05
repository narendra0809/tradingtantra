import mongoose from "mongoose";

const twoHLBreakSchema = new mongoose.Schema(
    {
        securityId:{
            type: String,
        },
        symbolName:{
            type: String,
        },
        underlyingSymbol:{
            type:String,
        },
        fiveMinHigh:{
            type: String,
        },
        type:{
            type: String,
            enum:['Bullish','Bearish'],
        },
        maxHigh: {
            type:String
        },
        percentageChange:{
            type: String
        },
        timestamp:{
            type: String,
            required: true
        }

    },{
        timestamps: true
    }
)

const TwoDayHighLowBreak = mongoose.model('TwoDayHighLowBreak',twoHLBreakSchema)
export default TwoDayHighLowBreak