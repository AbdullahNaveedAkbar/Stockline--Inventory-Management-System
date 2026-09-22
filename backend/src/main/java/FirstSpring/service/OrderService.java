package FirstSpring.service;


import FirstSpring.dto.CreateOrderRequest;
import FirstSpring.entity.Order;
import FirstSpring.entity.OrderStatus;

import java.util.List;

public interface OrderService {

    Order createOrder(String storeId, CreateOrderRequest request);

    List<Order> getOrdersByStore(String storeId);

    Order getOrderById(String orderId);



 }