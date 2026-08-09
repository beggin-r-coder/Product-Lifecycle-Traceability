package com.tcs.plts.repository;

import com.tcs.plts.common.enums.OrderStatus;
import com.tcs.plts.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByOrganizationId(Long organizationId);
    List<Order> findByOrganizationIdAndStatus(Long organizationId, OrderStatus status);

    List<Order> findByManufacturerId(Long manufacturerId);
    List<Order> findByManufacturerIdAndStatusIn(Long manufacturerId, List<OrderStatus> statuses);

    List<Order> findByQaId(Long qaId);
    List<Order> findByQaIdAndStatusIn(Long qaId, List<OrderStatus> statuses);

    List<Order> findByPackagingTransportId(Long packagingTransportId);
    List<Order> findByPackagingTransportIdAndStatusIn(Long packagingTransportId, List<OrderStatus> statuses);

    List<Order> findByRetailerId(Long retailerId);
    List<Order> findByRetailerIdAndStatusIn(Long retailerId, List<OrderStatus> statuses);

    long countByOrganizationId(Long organizationId);
    long countByOrganizationIdAndStatus(Long organizationId, OrderStatus status);
    long countByOrganizationIdAndStatusIn(Long organizationId, List<OrderStatus> statuses);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") OrderStatus status);

    @Query("SELECT o.status, COUNT(o) FROM Order o WHERE o.organization.id = :orgId GROUP BY o.status")
    List<Object[]> countOrdersByStatusForOrg(@Param("orgId") Long orgId);
}
