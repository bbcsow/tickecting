import React from 'react'

const OrderIndex = ({orders}) => {
  return (
    <ul>
        {orders.map(order => )}
      
    </ul>
  )
}


OrderIndex.getInitialProps = async (context, client) => {
    const { data } = await client.get(`/api/orders`);
  
    return { orders: data };
};
  

export default OrderIndex;