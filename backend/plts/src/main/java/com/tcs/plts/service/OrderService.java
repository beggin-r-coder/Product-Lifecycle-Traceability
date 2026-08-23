package com.tcs.plts.service;

import com.tcs.plts.common.enums.NotificationType;
import com.tcs.plts.common.enums.OrderStatus;
import com.tcs.plts.common.enums.Role;
import com.tcs.plts.dto.LifecycleStageDto;
import com.tcs.plts.dto.OrderDto;
import com.tcs.plts.entity.*;
import com.tcs.plts.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrganizationRepository organizationRepository;
    private final StakeholderRepository stakeholderRepository;
    private final LifecycleStageRepository lifecycleStageRepository;
    private final NotificationService notificationService;
    private final AuditLogRepository auditLogRepository;
    private final EmailService emailService;
    private final StakeholderService stakeholderService;

    @Transactional
    public OrderDto.Response createOrder(Long organizationId, OrderDto.CreateRequest request) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        String orderNumber = generateOrderNumber();
        String productQrCode = "QR-" + orderNumber;

        // Check if this is a premapped order
        boolean isPremapped = request.getManufacturerId() != null || request.getQaId() != null ||
                             request.getPackagingTransportId() != null || request.getRetailerId() != null;

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .productQrCode(productQrCode)
                .productName(request.getProductName())
                .description(request.getDescription())
                .quantity(request.getQuantity())
                .expectedDeliveryDate(request.getExpectedDeliveryDate())
                .priority(request.getPriority())
                .remarks(request.getRemarks())
                .status(OrderStatus.CREATED)
                .organization(org)
                .isPremapped(isPremapped)
                .build();

        // Handle premapped stakeholders
        if (request.getManufacturerId() != null) {
            Stakeholder manufacturer = stakeholderRepository.findById(request.getManufacturerId())
                    .orElseThrow(() -> new IllegalArgumentException("Manufacturer not found"));
            if (manufacturer.getRole() != Role.MANUFACTURER) {
                throw new IllegalArgumentException("Selected stakeholder is not a Manufacturer");
            }
            validatePremappedStakeholder(manufacturer, org);
            order.setManufacturer(manufacturer);
        }

        if (request.getQaId() != null) {
            Stakeholder qa = stakeholderRepository.findById(request.getQaId())
                    .orElseThrow(() -> new IllegalArgumentException("QA not found"));
            if (qa.getRole() != Role.QA) {
                throw new IllegalArgumentException("Selected stakeholder is not QA");
            }
            validatePremappedStakeholder(qa, org);
            order.setQa(qa);
        }

        if (request.getPackagingTransportId() != null) {
            Stakeholder pt = stakeholderRepository.findById(request.getPackagingTransportId())
                    .orElseThrow(() -> new IllegalArgumentException("Packaging & Transport not found"));
            if (pt.getRole() != Role.PACKAGING_TRANSPORT) {
                throw new IllegalArgumentException("Selected stakeholder is not Packaging & Transport");
            }
            validatePremappedStakeholder(pt, org);
            order.setPackagingTransport(pt);
        }

        if (request.getRetailerId() != null) {
            Stakeholder retailer = stakeholderRepository.findById(request.getRetailerId())
                    .orElseThrow(() -> new IllegalArgumentException("Retailer not found"));
            if (retailer.getRole() != Role.RETAILER) {
                throw new IllegalArgumentException("Selected stakeholder is not a Retailer");
            }
            validatePremappedStakeholder(retailer, org);
            order.setRetailer(retailer);
        }

        // A preselected manufacturer is the first executable hand-off. Move the
        // order into its assignment state immediately so it is visible in the
        // manufacturer's work queue instead of remaining stuck in CREATED.
        if (order.getManufacturer() != null) {
            order.setStatus(OrderStatus.MANUFACTURER_ASSIGNED);
        }

        orderRepository.save(order);

        // Add Initial Stage
        addLifecycleStage(order, OrderStatus.CREATED, "Order Created", org.getName(), Role.ORGANIZATION,
                "Order created in system with priority " + request.getPriority() + 
                (request.getManufacturerId() != null ? ". Premapped stakeholders assigned." : ""), 
                null, org.getUser().getEmail());

        if (order.getManufacturer() != null) {
            addLifecycleStage(order, OrderStatus.MANUFACTURER_ASSIGNED,
                    "Auto-assigned to Manufacturer (Premap)",
                    order.getManufacturer().getCompanyName(), Role.MANUFACTURER,
                    "Automatically assigned from premap configuration", null, "System");
        }

        // Audit Log
        auditLogRepository.save(AuditLog.builder()
                .action("ORDER_CREATED")
                .performedBy(org.getName())
                .role(Role.ORGANIZATION)
                .resource(orderNumber)
                .details("Created order for product: " + request.getProductName())
                .build());

        // Notify premapped manufacturer if set
        if (order.getManufacturer() != null && order.getManufacturer().getUser() != null) {
            notificationService.createNotification(order.getManufacturer().getUser(),
                    "New Manufacturing Assignment",
                    "You have been pre-assigned to manufacture Order #" + order.getOrderNumber() + " (" + order.getProductName() + ")",
                    NotificationType.ORDER_ASSIGNED, order.getOrderNumber());

            emailService.sendEmail(order.getManufacturer().getCompanyEmail(), "Manufacturing Task Assigned: Order #" + order.getOrderNumber(),
                    emailService.buildOrderAssignmentTemplate(order.getManufacturer().getPersonInCharge(), order.getOrderNumber(), order.getProductName(), "Manufacturing"));
        }

        return mapToResponse(order);
    }

    @Transactional
    public OrderDto.Response assignManufacturer(Long orderId, Long manufacturerId, String remarks) {
        Order order = getOrder(orderId);
        Stakeholder manufacturer = stakeholderRepository.findById(manufacturerId)
                .orElseThrow(() -> new IllegalArgumentException("Manufacturer not found"));

        if (manufacturer.getRole() != Role.MANUFACTURER) {
            throw new IllegalArgumentException("Selected stakeholder is not a Manufacturer");
        }

        order.setManufacturer(manufacturer);
        order.setStatus(OrderStatus.MANUFACTURER_ASSIGNED);
        orderRepository.save(order);

        addLifecycleStage(order, OrderStatus.MANUFACTURER_ASSIGNED, "Assigned to Manufacturer",
                manufacturer.getCompanyName(), Role.MANUFACTURER, remarks, null, order.getOrganization().getName());

        // Notifications
        if (manufacturer.getUser() != null) {
            notificationService.createNotification(manufacturer.getUser(),
                    "New Manufacturing Assignment",
                    "You have been assigned to manufacture Order #" + order.getOrderNumber() + " (" + order.getProductName() + ")",
                    NotificationType.ORDER_ASSIGNED, order.getOrderNumber());

            emailService.sendEmail(manufacturer.getCompanyEmail(), "Manufacturing Task Assigned: Order #" + order.getOrderNumber(),
                    emailService.buildOrderAssignmentTemplate(manufacturer.getPersonInCharge(), order.getOrderNumber(), order.getProductName(), "Manufacturing"));
        }

        return mapToResponse(order);
    }

    @Transactional
    public OrderDto.Response updateManufacturerStatus(Long orderId, String action, OrderDto.UpdateManufacturerProgressRequest request) {
        Order order = getOrder(orderId);
        Stakeholder manufacturer = order.getManufacturer();
        String mfgName = manufacturer != null ? manufacturer.getCompanyName() : "Manufacturer";

        if ("ACCEPT".equalsIgnoreCase(action)) {
            order.setStatus(OrderStatus.MANUFACTURING);
            addLifecycleStage(order, OrderStatus.MANUFACTURING, "Manufacturing Started", mfgName, Role.MANUFACTURER,
                    "Manufacturer accepted assignment and commenced production", null, mfgName);
        } else if ("REJECT".equalsIgnoreCase(action)) {
            order.setStatus(OrderStatus.REJECTED);
            addLifecycleStage(order, OrderStatus.REJECTED, "Manufacturing Rejected", mfgName, Role.MANUFACTURER,
                    "Manufacturer rejected task: " + (request != null ? request.getNotes() : ""), null, mfgName);
        } else if ("COMPLETE".equalsIgnoreCase(action)) {
            order.setStatus(OrderStatus.MANUFACTURING_COMPLETED);
            if (request != null) {
                order.setCompletionNotes(request.getNotes());
                order.setCompletionDocumentUrl(request.getDocumentUrl());
            }
            addLifecycleStage(order, OrderStatus.MANUFACTURING_COMPLETED, "Manufacturing Completed", mfgName, Role.MANUFACTURER,
                    "Manufacturing process completed. Notes: " + (request != null ? request.getNotes() : "N/A"),
                    request != null ? request.getDocumentUrl() : null, mfgName);

            // Auto-assign QA if premapped
            if (order.isPremapped() && order.getQa() != null) {
                Stakeholder qa = order.getQa();
                order.setStatus(OrderStatus.QA_ASSIGNED);
                addLifecycleStage(order, OrderStatus.QA_ASSIGNED, "Auto-assigned to Quality Assurance (Premap)",
                        qa.getCompanyName(), Role.QA, "Automatically assigned from premap configuration", null, "System");

                // Notify QA with stakeholder chain info
                String notificationMessage = buildStakeholderChainNotification(order, "Quality Assurance", mfgName, null);
                if (qa.getUser() != null) {
                    notificationService.createNotification(qa.getUser(),
                            "New QA Inspection Assignment (Auto-assigned)",
                            notificationMessage,
                            NotificationType.ORDER_ASSIGNED, order.getOrderNumber());

                    emailService.sendEmail(qa.getCompanyEmail(), "QA Inspection Assigned: Order #" + order.getOrderNumber(),
                            emailService.buildOrderAssignmentTemplate(qa.getPersonInCharge(), order.getOrderNumber(), order.getProductName(), "Quality Assurance"));
                }

                // Notify Organization about auto-assignment
                notificationService.createNotification(order.getOrganization().getUser(),
                        "QA Auto-assigned (Premap)",
                        "Order #" + order.getOrderNumber() + " - QA automatically assigned to " + qa.getCompanyName() + " via premap.",
                        NotificationType.STAGE_COMPLETED, order.getOrderNumber());
            } else {
                // Notify Organization for manual assignment
                notificationService.createNotification(order.getOrganization().getUser(),
                        "Manufacturing Completed",
                        "Manufacturing for Order #" + order.getOrderNumber() + " is completed. Click 'Proceed Next' to assign QA.",
                        NotificationType.STAGE_COMPLETED, order.getOrderNumber());

                emailService.sendEmail(order.getOrganization().getEmail(), "Order #" + order.getOrderNumber() + " - Manufacturing Completed",
                        "<p>Manufacturing completed for Order #" + order.getOrderNumber() + ". Please proceed to assign Quality Assurance in dashboard.</p>");
            }
        }

        orderRepository.save(order);
        return mapToResponse(order);
    }

    @Transactional
    public OrderDto.Response assignQa(Long orderId, Long qaId, String remarks) {
        Order order = getOrder(orderId);
        Stakeholder qa = stakeholderRepository.findById(qaId)
                .orElseThrow(() -> new IllegalArgumentException("QA Stakeholder not found"));

        if (qa.getRole() != Role.QA) {
            throw new IllegalArgumentException("Selected stakeholder is not QA");
        }

        order.setQa(qa);
        order.setStatus(OrderStatus.QA_ASSIGNED);
        orderRepository.save(order);

        addLifecycleStage(order, OrderStatus.QA_ASSIGNED, "Assigned to Quality Assurance",
                qa.getCompanyName(), Role.QA, remarks, null, order.getOrganization().getName());

        if (qa.getUser() != null) {
            notificationService.createNotification(qa.getUser(),
                    "New QA Inspection Assignment",
                    "Assigned for QA Inspection on Order #" + order.getOrderNumber(),
                    NotificationType.ORDER_ASSIGNED, order.getOrderNumber());

            emailService.sendEmail(qa.getCompanyEmail(), "QA Inspection Assigned: Order #" + order.getOrderNumber(),
                    emailService.buildOrderAssignmentTemplate(qa.getPersonInCharge(), order.getOrderNumber(), order.getProductName(), "Quality Assurance"));
        }

        return mapToResponse(order);
    }

    @Transactional
    public OrderDto.Response updateQaStatus(Long orderId, String action, OrderDto.UpdateQaReportRequest request) {
        Order order = getOrder(orderId);
        Stakeholder qa = order.getQa();
        String qaName = qa != null ? qa.getCompanyName() : "Quality Assurance";

        if ("ACCEPT".equalsIgnoreCase(action)) {
            order.setStatus(OrderStatus.QA_IN_PROGRESS);
            addLifecycleStage(order, OrderStatus.QA_IN_PROGRESS, "QA Inspection In Progress", qaName, Role.QA,
                    "QA team accepted inspection request", null, qaName);
        } else if ("REJECT".equalsIgnoreCase(action)) {
            order.setStatus(OrderStatus.REJECTED);
            addLifecycleStage(order, OrderStatus.REJECTED, "QA Inspection Rejected", qaName, Role.QA,
                    "QA team rejected inspection request", null, qaName);
        } else if ("SUBMIT_REPORT".equalsIgnoreCase(action)) {
            boolean passed = request.getPassed() != null && request.getPassed();
            order.setQaRemarks(request.getQaRemarks());
            order.setQaReportUrl(request.getQaReportUrl());
            order.setQaPassed(passed);

            if (passed) {
                order.setStatus(OrderStatus.QA_COMPLETED);
                addLifecycleStage(order, OrderStatus.QA_COMPLETED, "QA Inspection Passed", qaName, Role.QA,
                        "Inspection Passed. Remarks: " + request.getQaRemarks(), request.getQaReportUrl(), qaName);

                // Auto-assign Packaging & Transport if premapped
                if (order.isPremapped() && order.getPackagingTransport() != null) {
                    Stakeholder pt = order.getPackagingTransport();
                    order.setStatus(OrderStatus.PACKAGING_ASSIGNED);
                    addLifecycleStage(order, OrderStatus.PACKAGING_ASSIGNED, "Auto-assigned to Packaging & Transport (Premap)",
                            pt.getCompanyName(), Role.PACKAGING_TRANSPORT, "Automatically assigned from premap configuration", null, "System");

                    // Notify Packaging & Transport with stakeholder chain info
                    String ptName = pt.getCompanyName();
                    String notificationMessage = buildStakeholderChainNotification(order, "Packaging & Transport", qaName,
                            order.getRetailer() != null ? order.getRetailer().getCompanyName() : null);
                    if (pt.getUser() != null) {
                        notificationService.createNotification(pt.getUser(),
                                "New Packaging Assignment (Auto-assigned)",
                                notificationMessage,
                                NotificationType.ORDER_ASSIGNED, order.getOrderNumber());

                        emailService.sendEmail(pt.getCompanyEmail(), "Packaging & Transport Assigned: Order #" + order.getOrderNumber(),
                                emailService.buildOrderAssignmentTemplate(pt.getPersonInCharge(), order.getOrderNumber(), order.getProductName(), "Packaging & Transport"));
                    }

                    // Notify Organization about auto-assignment
                    notificationService.createNotification(order.getOrganization().getUser(),
                            "Packaging & Transport Auto-assigned (Premap)",
                            "Order #" + order.getOrderNumber() + " - Packaging & Transport automatically assigned to " + ptName + " via premap.",
                            NotificationType.STAGE_COMPLETED, order.getOrderNumber());
                } else {
                    // Notify Organization for manual assignment
                    notificationService.createNotification(order.getOrganization().getUser(),
                            "QA Passed",
                            "Order #" + order.getOrderNumber() + " passed QA inspection. Click 'Proceed Next' to assign Packaging & Transport.",
                            NotificationType.STAGE_COMPLETED, order.getOrderNumber());
                }
            } else {
                order.setStatus(OrderStatus.REJECTED);
                addLifecycleStage(order, OrderStatus.REJECTED, "QA Inspection Failed", qaName, Role.QA,
                        "Inspection Failed. Remarks: " + request.getQaRemarks(), request.getQaReportUrl(), qaName);

                notificationService.createNotification(order.getOrganization().getUser(),
                        "QA Inspection Failed",
                        "Order #" + order.getOrderNumber() + " FAILED QA inspection. Remarks: " + request.getQaRemarks(),
                        NotificationType.STAGE_COMPLETED, order.getOrderNumber());
            }
        }

        orderRepository.save(order);
        return mapToResponse(order);
    }

    @Transactional
    public OrderDto.Response assignPackaging(Long orderId, Long ptId, String remarks) {
        Order order = getOrder(orderId);
        Stakeholder pt = stakeholderRepository.findById(ptId)
                .orElseThrow(() -> new IllegalArgumentException("Packaging & Transport Stakeholder not found"));

        if (pt.getRole() != Role.PACKAGING_TRANSPORT) {
            throw new IllegalArgumentException("Selected stakeholder is not Packaging & Transport");
        }

        order.setPackagingTransport(pt);
        order.setStatus(OrderStatus.PACKAGING_ASSIGNED);
        orderRepository.save(order);

        addLifecycleStage(order, OrderStatus.PACKAGING_ASSIGNED, "Assigned to Packaging & Transport",
                pt.getCompanyName(), Role.PACKAGING_TRANSPORT, remarks, null, order.getOrganization().getName());

        if (pt.getUser() != null) {
            notificationService.createNotification(pt.getUser(),
                    "New Packaging Assignment",
                    "Assigned for Packaging & Transport on Order #" + order.getOrderNumber(),
                    NotificationType.ORDER_ASSIGNED, order.getOrderNumber());

            emailService.sendEmail(pt.getCompanyEmail(), "Packaging & Transport Assigned: Order #" + order.getOrderNumber(),
                    emailService.buildOrderAssignmentTemplate(pt.getPersonInCharge(), order.getOrderNumber(), order.getProductName(), "Packaging & Transport"));
        }

        return mapToResponse(order);
    }

    @Transactional
    public OrderDto.Response updatePackagingStatus(Long orderId, String action, OrderDto.UpdateShippingDetailsRequest request) {
        Order order = getOrder(orderId);
        Stakeholder pt = order.getPackagingTransport();
        String ptName = pt != null ? pt.getCompanyName() : "Packaging & Transport";

        if ("ACCEPT".equalsIgnoreCase(action)) {
            order.setStatus(OrderStatus.PACKAGING_IN_PROGRESS);
            addLifecycleStage(order, OrderStatus.PACKAGING_IN_PROGRESS, "Packaging Started", ptName, Role.PACKAGING_TRANSPORT,
                    "Packaging team accepted request", null, ptName);
        } else if ("DISPATCH".equalsIgnoreCase(action)) {
            order.setStatus(OrderStatus.PACKAGING_COMPLETED);
            if (request != null) {
                order.setTrackingNumber(request.getTrackingNumber());
                order.setVehicleDetails(request.getVehicleDetails());
                order.setEstimatedDelivery(request.getEstimatedDelivery());
            }
            addLifecycleStage(order, OrderStatus.PACKAGING_COMPLETED, "Dispatched & Packaging Completed", ptName, Role.PACKAGING_TRANSPORT,
                    "Dispatched via tracking #" + order.getTrackingNumber() + ", Vehicle: " + order.getVehicleDetails(), null, ptName);
        } else if ("MARK_TRANSPORT_COMPLETE".equalsIgnoreCase(action)) {
            order.setStatus(OrderStatus.TRANSPORT_COMPLETED);
            addLifecycleStage(order, OrderStatus.TRANSPORT_COMPLETED, "Transport Completed", ptName, Role.PACKAGING_TRANSPORT,
                    "Shipment arrived at destination center", null, ptName);

            // Auto-assign Retailer if premapped
            if (order.isPremapped() && order.getRetailer() != null) {
                Stakeholder retailer = order.getRetailer();
                order.setStatus(OrderStatus.RETAILER_ASSIGNED);
                addLifecycleStage(order, OrderStatus.RETAILER_ASSIGNED, "Auto-assigned to Retailer (Premap)",
                        retailer.getCompanyName(), Role.RETAILER, "Automatically assigned from premap configuration", null, "System");

                // Notify Retailer with stakeholder chain info
                String retailerName = retailer.getCompanyName();
                String notificationMessage = buildStakeholderChainNotification(order, "Retailer Delivery", ptName, null);
                if (retailer.getUser() != null) {
                    notificationService.createNotification(retailer.getUser(),
                            "New Shipment For Delivery (Auto-assigned)",
                            notificationMessage,
                            NotificationType.ORDER_ASSIGNED, order.getOrderNumber());

                    emailService.sendEmail(retailer.getCompanyEmail(), "Shipment Delivery Assigned: Order #" + order.getOrderNumber(),
                            emailService.buildOrderAssignmentTemplate(retailer.getPersonInCharge(), order.getOrderNumber(), order.getProductName(), "Retailer"));
                }

                // Notify Organization about auto-assignment
                notificationService.createNotification(order.getOrganization().getUser(),
                        "Retailer Auto-assigned (Premap)",
                        "Order #" + order.getOrderNumber() + " - Retailer automatically assigned to " + retailerName + " via premap.",
                        NotificationType.STAGE_COMPLETED, order.getOrderNumber());
            } else {
                // Notify Organization for manual assignment
                notificationService.createNotification(order.getOrganization().getUser(),
                        "Transport Completed",
                        "Order #" + order.getOrderNumber() + " transport completed. Click 'Proceed Next' to assign Retailer.",
                        NotificationType.STAGE_COMPLETED, order.getOrderNumber());
            }
        }

        orderRepository.save(order);
        return mapToResponse(order);
    }

    @Transactional
    public OrderDto.Response assignRetailer(Long orderId, Long retailerId, String remarks) {
        Order order = getOrder(orderId);
        Stakeholder retailer = stakeholderRepository.findById(retailerId)
                .orElseThrow(() -> new IllegalArgumentException("Retailer not found"));

        if (retailer.getRole() != Role.RETAILER) {
            throw new IllegalArgumentException("Selected stakeholder is not a Retailer");
        }

        order.setRetailer(retailer);
        order.setStatus(OrderStatus.RETAILER_ASSIGNED);
        orderRepository.save(order);

        addLifecycleStage(order, OrderStatus.RETAILER_ASSIGNED, "Assigned to Retailer",
                retailer.getCompanyName(), Role.RETAILER, remarks, null, order.getOrganization().getName());

        if (retailer.getUser() != null) {
            notificationService.createNotification(retailer.getUser(),
                    "New Shipment For Delivery",
                    "Shipment assigned for Order #" + order.getOrderNumber(),
                    NotificationType.ORDER_ASSIGNED, order.getOrderNumber());

            emailService.sendEmail(retailer.getCompanyEmail(), "Shipment Delivery Assigned: Order #" + order.getOrderNumber(),
                    emailService.buildOrderAssignmentTemplate(retailer.getPersonInCharge(), order.getOrderNumber(), order.getProductName(), "Retailer"));
        }

        return mapToResponse(order);
    }

    @Transactional
    public OrderDto.Response updateRetailerStatus(Long orderId, String action) {
        Order order = getOrder(orderId);
        Stakeholder retailer = order.getRetailer();
        String retName = retailer != null ? retailer.getCompanyName() : "Retailer";

        if ("CONFIRM_DELIVERY".equalsIgnoreCase(action)) {
            order.setStatus(OrderStatus.DELIVERED);
            addLifecycleStage(order, OrderStatus.DELIVERED, "Shipment Delivered", retName, Role.RETAILER,
                    "Retailer confirmed receipt of physical shipment", null, retName);
        } else if ("CLOSE_LIFECYCLE".equalsIgnoreCase(action) || "MARK_AVAILABLE".equalsIgnoreCase(action)) {
            order.setStatus(OrderStatus.COMPLETED);
            addLifecycleStage(order, OrderStatus.COMPLETED, "Lifecycle Completed & Product Available", retName, Role.RETAILER,
                    "Product verified and put on retail market. Complete end-to-end lifecycle closed successfully.", null, retName);

            notificationService.createNotification(order.getOrganization().getUser(),
                    "Order Lifecycle Completed",
                    "Order #" + order.getOrderNumber() + " has completed its entire lifecycle and is available in retail!",
                    NotificationType.LIFECYCLE_COMPLETED, order.getOrderNumber());

            emailService.sendEmail(order.getOrganization().getEmail(), "Order #" + order.getOrderNumber() + " - Lifecycle Completed",
                    "<h2>Lifecycle Completed</h2><p>Order #" + order.getOrderNumber() + " has closed all lifecycle stages successfully!</p>");
        }

        orderRepository.save(order);
        return mapToResponse(order);
    }

    public OrderDto.Response getOrderById(Long id) {
        Order order = getOrder(id);
        return mapToResponse(order);
    }

    public OrderDto.Response getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with number: " + orderNumber));
        return mapToResponse(order);
    }

    public List<OrderDto.Response> getOrdersByOrg(Long orgId) {
        return orderRepository.findByOrganizationId(orgId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderDto.Response> getOrdersForStakeholder(Long stakeholderId, Role role) {
        List<Order> orders = switch (role) {
            case MANUFACTURER -> orderRepository.findByManufacturerId(stakeholderId);
            case QA -> orderRepository.findByQaId(stakeholderId);
            case PACKAGING_TRANSPORT -> orderRepository.findByPackagingTransportId(stakeholderId);
            case RETAILER -> orderRepository.findByRetailerId(stakeholderId);
            default -> Collections.emptyList();
        };
        return orders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<OrderDto.Response> getOrdersForStakeholderUser(Long userId, Role role) {
        Stakeholder stakeholder = stakeholderRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Stakeholder profile not found for the logged-in user"));

        if (stakeholder.getRole() != role) {
            throw new IllegalArgumentException("The requested role does not match the stakeholder profile");
        }

        return getOrdersForStakeholder(stakeholder.getId(), role);
    }

    private Order getOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));
    }

    private void addLifecycleStage(Order order, OrderStatus stageStatus, String title, String responsibleCompany, Role role, String remarks, String attachmentUrl, String performedBy) {
        LifecycleStage stage = LifecycleStage.builder()
                .order(order)
                .stageStatus(stageStatus)
                .stageTitle(title)
                .responsibleCompanyName(responsibleCompany)
                .responsibleRole(role)
                .remarks(remarks)
                .attachmentUrl(attachmentUrl)
                .performedByUserId(performedBy)
                .timestamp(LocalDateTime.now())
                .build();

        lifecycleStageRepository.save(stage);
        order.getLifecycleStages().add(stage);
    }

    private void validatePremappedStakeholder(Stakeholder stakeholder, Organization organization) {
        if (!stakeholder.isActive()) {
            throw new IllegalArgumentException("Selected stakeholder is inactive");
        }
        if (!stakeholder.getOrganization().getId().equals(organization.getId())) {
            throw new IllegalArgumentException("Selected stakeholder does not belong to this organization");
        }
    }

    private String generateOrderNumber() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int rand = new Random().nextInt(9000) + 1000;
        return "ORD-" + dateStr + "-" + rand;
    }

    private String buildStakeholderChainNotification(Order order, String currentStage, String precedingStakeholder, String succeedingStakeholder) {
        StringBuilder message = new StringBuilder();
        message.append("You have been assigned to ").append(currentStage).append(" for Order #").append(order.getOrderNumber());
        message.append(" (").append(order.getProductName()).append("). ");

        if (precedingStakeholder != null) {
            message.append("Preceding stakeholder: ").append(precedingStakeholder).append(". ");
        }

        if (succeedingStakeholder != null) {
            message.append("Succeeding stakeholder: ").append(succeedingStakeholder).append(". ");
        }

        message.append("This is an automatic assignment via premap configuration.");
        return message.toString();
    }

    @Transactional
    public OrderDto.Response cancelOrder(Long orderId, OrderDto.CancelOrderRequest request) {
        Order order = getOrder(orderId);
        
        // Check if order can be cancelled (not already completed or delivered)
        if (order.getStatus() == OrderStatus.COMPLETED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalArgumentException("Cannot cancel completed or delivered orders");
        }

        order.setStatus(OrderStatus.REJECTED);
        orderRepository.save(order);

        addLifecycleStage(order, OrderStatus.REJECTED, "Order Cancelled", 
                order.getOrganization().getName(), Role.ORGANIZATION,
                "Order cancelled by organization. Reason: " + request.getReason(), 
                null, order.getOrganization().getName());

        // Notify all assigned stakeholders
        List<Stakeholder> stakeholdersToNotify = new ArrayList<>();
        if (order.getManufacturer() != null) stakeholdersToNotify.add(order.getManufacturer());
        if (order.getQa() != null) stakeholdersToNotify.add(order.getQa());
        if (order.getPackagingTransport() != null) stakeholdersToNotify.add(order.getPackagingTransport());
        if (order.getRetailer() != null) stakeholdersToNotify.add(order.getRetailer());

        for (Stakeholder stakeholder : stakeholdersToNotify) {
            if (stakeholder.getUser() != null) {
                notificationService.createNotification(stakeholder.getUser(),
                        "Order Cancelled",
                        "Order #" + order.getOrderNumber() + " has been cancelled by the organization. Reason: " + request.getReason(),
                        NotificationType.ORDER_CANCELLED, order.getOrderNumber());

                emailService.sendEmail(stakeholder.getCompanyEmail(), 
                        "Order Cancelled: #" + order.getOrderNumber(),
                        "<p>Order #" + order.getOrderNumber() + " has been cancelled by the organization.</p>" +
                        "<p><strong>Reason:</strong> " + request.getReason() + "</p>");
            }
        }

        // Audit Log
        auditLogRepository.save(AuditLog.builder()
                .action("ORDER_CANCELLED")
                .performedBy(order.getOrganization().getName())
                .role(Role.ORGANIZATION)
                .resource(order.getOrderNumber())
                .details("Order cancelled. Reason: " + request.getReason())
                .build());

        return mapToResponse(order);
    }

    public OrderDto.Response mapToResponse(Order order) {
        List<LifecycleStageDto.Response> stages = order.getLifecycleStages().stream()
                .map(s -> LifecycleStageDto.Response.builder()
                        .id(s.getId())
                        .stageStatus(s.getStageStatus())
                        .stageTitle(s.getStageTitle())
                        .responsibleCompanyName(s.getResponsibleCompanyName())
                        .responsibleRole(s.getResponsibleRole())
                        .remarks(s.getRemarks())
                        .attachmentUrl(s.getAttachmentUrl())
                        .performedByUserId(s.getPerformedByUserId())
                        .timestamp(s.getTimestamp())
                        .build())
                .collect(Collectors.toList());

        return OrderDto.Response.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .productQrCode(order.getProductQrCode())
                .productName(order.getProductName())
                .description(order.getDescription())
                .quantity(order.getQuantity())
                .expectedDeliveryDate(order.getExpectedDeliveryDate())
                .priority(order.getPriority())
                .remarks(order.getRemarks())
                .status(order.getStatus())
                .organizationName(order.getOrganization().getName())
                .organizationId(order.getOrganization().getId())
                .isPremapped(order.isPremapped())
                .manufacturer(order.getManufacturer() != null ? stakeholderService.mapToResponse(order.getManufacturer()) : null)
                .qa(order.getQa() != null ? stakeholderService.mapToResponse(order.getQa()) : null)
                .packagingTransport(order.getPackagingTransport() != null ? stakeholderService.mapToResponse(order.getPackagingTransport()) : null)
                .retailer(order.getRetailer() != null ? stakeholderService.mapToResponse(order.getRetailer()) : null)
                .trackingNumber(order.getTrackingNumber())
                .vehicleDetails(order.getVehicleDetails())
                .estimatedDelivery(order.getEstimatedDelivery())
                .completionNotes(order.getCompletionNotes())
                .completionDocumentUrl(order.getCompletionDocumentUrl())
                .qaRemarks(order.getQaRemarks())
                .qaReportUrl(order.getQaReportUrl())
                .qaPassed(order.getQaPassed())
                .productSerialNumber(order.getProductSerialNumber())
                .manufacturingBatchId(order.getManufacturingBatchId())
                .qaBatchId(order.getQaBatchId())
                .packagingBatchId(order.getPackagingBatchId())
                .transportBatchId(order.getTransportBatchId())
                .rawMaterialBatchId(order.getRawMaterialBatchId())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .lifecycleStages(stages)
                .build();
    }
}
