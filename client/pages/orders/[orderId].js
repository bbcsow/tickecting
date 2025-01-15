import React from 'react';
import { useEffect, useState } from 'react';
import StripeChekout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';

const OrderShow = ({ order, currentUser }) => {

    const [timeLeft, setTimeLeft] = useState(0)
    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: (payment) => console.log(payment)
    });


    useEffect(() => {
        const findTimeLeft = () => {
            setTimeLeft(Math.round((new Date(order.expiresAt) - new Date()) / 1000));
        };

        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000);

        return () => {
            clearInterval(timerId);
        };
    }, [order]);

    if (timeLeft <= 0) {
        return <div>Order expired</div>
    }

  return (
    <div>
        Time left to pay: { timeLeft } seconds
        <StripeChekout 
            token={(token) => doRequest({toekn: id}) }
            stripeKey='pk_test_51QQqPSGOv6nYSw2DlGXUJ4FiH9wgw3AtyleVsvJgvKkfVmNaCBFrpThGX7CTt9hljCCj87fvRrtiNynIxIs0Iscx00JSYAWg4q'
            amount={order.ticket.price * 100}
            email={currentUser.email}
        />
    </div>
  );

};

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);
  
    return { order: data };
  };

export default OrderShow;
