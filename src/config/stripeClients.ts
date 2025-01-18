import Stripe from "stripe";
import dotenv from 'dotenv'
import { domainToASCII } from "url";

dotenv.config()

const stripeSecretKey = process.env.REACT_STRIPE_SECRET_KEY as string;
const stripeClient  = new Stripe(stripeSecretKey, {
    apiVersion: '2022-11-15' as any,
 });

 export default stripeClient ;