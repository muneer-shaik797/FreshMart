package com.freshmart.grocery.config;

import com.freshmart.grocery.model.*;
import com.freshmart.grocery.repository.CouponRepository;
import com.freshmart.grocery.repository.OrderRepository;
import com.freshmart.grocery.repository.ProductRepository;
import com.freshmart.grocery.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final OrderRepository orderRepository;
    private final com.freshmart.grocery.repository.PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      ProductRepository productRepository,
                      CouponRepository couponRepository,
                      OrderRepository orderRepository,
                      com.freshmart.grocery.repository.PaymentRepository paymentRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedCoupons();
        seedProducts();
        seedSampleOrders();
        seedPayments();
    }

    private void seedUsers() {
        // Ensure requested admin account: admin@gmail.com / admin@123
        userRepository.findByEmail("admin@gmail.com").ifPresentOrElse(existingAdmin -> {
            existingAdmin.setPassword(passwordEncoder.encode("admin@123"));
            existingAdmin.setRole("ROLE_ADMIN");
            userRepository.save(existingAdmin);
            logger.info("Ensured Admin credentials for admin@gmail.com");
        }, () -> {
            User admin = new User("Store Administrator", "admin@gmail.com",
                    passwordEncoder.encode("admin@123"), "ROLE_ADMIN", "+91 99001 12233");
            admin.getAddresses().add(new Address("addr_adm", "Store Admin", "+91 99001 12233",
                    "FreshMart Central Hub, 4th Cross", "Floor 2", "Bangalore", "Karnataka", "560001", "Near Metro Station", true));
            userRepository.save(admin);
            logger.info("Created Admin user: admin@gmail.com / admin@123");
        });

        if (!userRepository.existsByEmail("admin@freshmart.com")) {
            User admin = new User("Store Administrator", "admin@freshmart.com",
                    passwordEncoder.encode("admin123"), "ROLE_ADMIN", "+91 99001 12233");
            admin.getAddresses().add(new Address("addr_adm2", "Store Admin", "+91 99001 12233",
                    "FreshMart Central Hub, 4th Cross", "Floor 2", "Bangalore", "Karnataka", "560001", "Near Metro Station", true));
            userRepository.save(admin);
        }

        if (!userRepository.existsByEmail("john@example.com")) {
            User customer = new User("John Doe", "john@example.com",
                    passwordEncoder.encode("customer123"), "ROLE_CUSTOMER", "+91 98877 66554");
            customer.getAddresses().add(new Address("addr_cust1", "John Doe", "+91 98877 66554",
                    "742 Evergreen Avenue, Green Glen Layout", "Apt 4B", "Bangalore", "Karnataka", "560103", "Opposite Community Park", true));
            userRepository.save(customer);
            logger.info("Seeded Customer user: john@example.com / customer123");
        }
    }

    private void seedCoupons() {
        if (couponRepository.count() == 0) {
            List<Coupon> coupons = List.of(
                    new Coupon("FRESH20", "20% off up to ₹150 on fresh farm groceries", 20.0, 0, 150.0, 399.0, Instant.now().plus(60, ChronoUnit.DAYS)),
                    new Coupon("SUPERGROCERY", "Flat ₹100 OFF on orders above ₹599", 0, 100.0, 100.0, 599.0, Instant.now().plus(60, ChronoUnit.DAYS)),
                    new Coupon("FIRST50", "Flat ₹50 OFF for welcome orders above ₹299", 0, 50.0, 50.0, 299.0, Instant.now().plus(90, ChronoUnit.DAYS)),
                    new Coupon("ORGANIC15", "15% off up to ₹200 on 100% certified organic items", 15.0, 0, 200.0, 450.0, Instant.now().plus(45, ChronoUnit.DAYS))
            );
            couponRepository.saveAll(coupons);
            logger.info("Seeded promotional discount coupons.");
        }
    }

    private void seedProducts() {
        if (productRepository.count() == 0) {
            List<Product> products = new ArrayList<>();

            // Fresh Produce
            products.add(new Product("Alphonso Mangoes (Ratnagiri)",
                    "Naturally ripened sweet and aromatic Ratnagiri Alphonso mangoes, handpicked from chemical-free orchards.",
                    "Fresh Produce", 449.0, 599.0, "1 Dozen (12 pcs)", 35,
                    "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("Farm Fresh", "Organic", "Summer Special"), true, true));

            products.add(new Product("Hydroponic Baby Spinach",
                    "Pesticide-free tender baby spinach leaves cultivated in nutrient-rich hydroponic water systems.",
                    "Fresh Produce", 69.0, 89.0, "250 g pack", 40,
                    "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("Hydroponic", "Organic", "Iron Rich"), true, true));

            products.add(new Product("Fresh Broccoli Florets",
                    "Crisp, vibrant green broccoli packed with vital vitamins and natural antioxidants.",
                    "Fresh Produce", 85.0, 110.0, "500 g", 25,
                    "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("Farm Fresh", "Immunity"), false, false));

            products.add(new Product("Royal Gala Red Apples",
                    "Juicy, crunchy and naturally sweet Washington Gala apples with polished red skin.",
                    "Fresh Produce", 189.0, 240.0, "4 pcs (approx 650g)", 50,
                    "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("Imported", "Fiber Rich"), false, true));

            products.add(new Product("Organic Sweet Bell Peppers (Tricolor)",
                    "A vibrant trio of Red, Yellow and Green bell peppers grown organically in greenhouse soil.",
                    "Fresh Produce", 129.0, 160.0, "3 pcs (Tricolor)", 20,
                    "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("Organic", "Vibrant"), true, false));

            // Dairy & Eggs
            products.add(new Product("A2 Organic Farm Fresh Milk",
                    "Pure unpasteurized single-origin A2 Desi Gir cow milk, chilled instantly at the farm.",
                    "Dairy & Eggs", 88.0, 99.0, "1 Litre Glass Bottle", 30,
                    "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("A2 Milk", "Pure Gir Cow", "Organic"), true, true));

            products.add(new Product("Artisanal Greek Yogurt (Plain)",
                    "Thick, strained Greek yogurt with zero added sugar and 14g natural protein per cup.",
                    "Dairy & Eggs", 95.0, 120.0, "400 g tub", 28,
                    "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("High Protein", "Probiotic", "Gluten-Free"), false, false));

            products.add(new Product("Free-Range Country Brown Eggs",
                    "Nutritious brown eggs laid by pasture-raised grain-fed country hens. High in Omega-3.",
                    "Dairy & Eggs", 115.0, 140.0, "Pack of 12", 45,
                    "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("Pasture Raised", "Omega 3", "High Protein"), true, true));

            products.add(new Product("Artisan Aged Cheddar Cheese",
                    "Aged 12 months for a sharp, nutty profile with a crumbly crystal texture.",
                    "Dairy & Eggs", 275.0, 320.0, "200 g block", 15,
                    "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("Gourmet", "Aged"), false, false));

            // Bakery & Bread
            products.add(new Product("Naturally Fermented Sourdough Loaf",
                    "Slow fermented for 36 hours with wild yeast and stoneground whole wheat flour. Crusty exterior with an airy crumb.",
                    "Bakery & Bread", 140.0, 175.0, "450 g Loaf", 18,
                    "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("Wild Yeast", "Artisanal", "Gut Friendly"), true, true));

            products.add(new Product("French Butter Croissants",
                    "Authentic flaky, buttery croissants made with premium Normandy butter, freshly baked every morning.",
                    "Bakery & Bread", 160.0, 190.0, "Pack of 2", 22,
                    "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("French Recipe", "Freshly Baked"), false, false));

            products.add(new Product("Ancient Grain Multigrain Bread",
                    "Enriched with rolled oats, chia seeds, flax seeds and sunflower kernels for sustained morning energy.",
                    "Bakery & Bread", 75.0, 90.0, "400 g sliced", 30,
                    "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("High Fiber", "Whole Grain"), false, false));

            // Beverages
            products.add(new Product("Cold-Pressed Valencia Orange Juice",
                    "100% pure raw Valencia oranges. Never heated, no added sugar, artificial flavors or preservatives.",
                    "Beverages", 120.0, 150.0, "300 ml bottle", 25,
                    "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("100% Juice", "No Added Sugar", "Cold Pressed"), true, true));

            products.add(new Product("Cold Brew Organic Black Coffee",
                    "Steeped for 18 hours using single-estate Arabica beans from Chikmagalur estates. Low acidity, rich crema notes.",
                    "Beverages", 135.0, 160.0, "250 ml", 20,
                    "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("Arabica", "Zero Sugar", "Organic"), true, false));

            products.add(new Product("Sparkling Tender Coconut Water",
                    "Refreshing pure young tender coconut water infused with subtle natural effervescence and electrolytes.",
                    "Beverages", 65.0, 75.0, "250 ml can", 40,
                    "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("Electrolytes", "Hydration"), false, false));

            // Pantry & Staples
            products.add(new Product("Extra Virgin Cold Pressed Olive Oil",
                    "First cold-pressed Spanish Koroneiki olives with an acidity below 0.3%. Ideal for drizzling and gourmet cooking.",
                    "Pantry & Staples", 799.0, 999.0, "500 ml Glass", 24,
                    "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("Heart Healthy", "Cold Pressed", "Gourmet"), true, true));

            products.add(new Product("Aged Royal Basmati Rice (2 Years Aged)",
                    "Extra-long slender pearl grains aged for 24 months for an unmistakable royal aroma and non-sticky cooking.",
                    "Pantry & Staples", 320.0, 390.0, "2 kg pouch", 50,
                    "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("Aged Basmati", "Aromatic"), false, false));

            products.add(new Product("Organic Raw Forest Honey",
                    "Unpasteurized, unprocessed multi-floral honey harvested directly from wild hives in deep deciduous forests.",
                    "Pantry & Staples", 399.0, 480.0, "500 g jar", 22,
                    "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("Wild Honey", "Raw", "Immunity"), true, true));

            // Snacks & Confectionery
            products.add(new Product("Roasted California Almonds (Lightly Salted)",
                    "Crisp, dry roasted non-GMO jumbo California almonds seasoned with Himalayan pink crystal salt.",
                    "Snacks & Confectionery", 349.0, 420.0, "250 g zipper pouch", 35,
                    "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("Dry Roasted", "Superfood", "Himalayan Salt"), false, true));

            products.add(new Product("85% Single-Origin Dark Chocolate Bar",
                    "Handcrafted bean-to-bar dark chocolate with deep roasted cacao nibs and Madagascar vanilla pods.",
                    "Snacks & Confectionery", 195.0, 240.0, "80 g bar", 30,
                    "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("Artisanal", "Vegan", "Bean-To-Bar"), true, false));

            // Meat & Seafood
            products.add(new Product("Fresh Norwegian Salmon Fillet",
                    "Air-flown Atlantic salmon portion, rich in beneficial Omega-3 fatty acids, skin-on and deboned.",
                    "Meat & Seafood", 699.0, 850.0, "250 g portion", 12,
                    "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("Fresh Catch", "Omega 3", "Premium"), false, true));

            products.add(new Product("Tender Antibiotic-Free Chicken Breast",
                    "Boneless skinless chicken breast cut from farm-raised poultry fed on natural vegetarian grain.",
                    "Meat & Seafood", 260.0, 310.0, "500 g pack", 28,
                    "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("Antibiotic Free", "Lean Protein"), false, false));

            // Organic & Health
            products.add(new Product("Organic Quinoa Grain (Pre-Washed)",
                    "Complete vegetarian protein packed with all 9 essential amino acids and dietary fiber. Saponin-free pre-washed.",
                    "Organic & Health", 240.0, 290.0, "500 g", 30,
                    "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("Gluten Free", "Superfood", "Organic"), true, true));

            products.add(new Product("Cold Milled Organic Chia Seeds",
                    "Rich in soluble fiber, calcium, and plant-based ALA Omega-3. Perfect for smoothies and overnight oats.",
                    "Organic & Health", 170.0, 210.0, "200 g pouch", 35,
                    "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80",
                    Arrays.asList("Raw", "Organic", "Keto Friendly"), true, false));

            productRepository.saveAll(products);
            logger.info("Seeded 24 rich grocery products across 8 categories.");
        }
    }

    private void seedSampleOrders() {
        if (orderRepository.count() == 0) {
            User customer = userRepository.findByEmail("john@example.com").orElse(null);
            if (customer == null) return;

            List<Product> products = productRepository.findAll();
            if (products.size() < 3) return;

            // Sample Order 1: OUT_FOR_DELIVERY (Live tracking active!)
            Order order1 = new Order();
            order1.setOrderNumber("FM-98421085");
            order1.setUserId(customer.getId());
            order1.setCustomerName(customer.getName());
            order1.setCustomerEmail(customer.getEmail());
            order1.setCustomerPhone(customer.getPhone());
            order1.setDeliveryAddress(customer.getAddresses().get(0));
            order1.setDeliverySlot(new DeliverySlot("express_45m", "Express Delivery (Under 45 Mins)", "EXPRESS", 25.0, "Today"));
            order1.setDeliveryNotes("Please ring the bell and leave by the door if not answered.");
            order1.setPaymentMethod("ONLINE_RAZORPAY");
            order1.setPaymentStatus("PAID");
            order1.setRazorpayOrderId("order_demo_112233");
            order1.setRazorpayPaymentId("pay_demo_success_9988");

            List<OrderItem> items1 = List.of(
                    new OrderItem(products.get(0).getId(), products.get(0).getName(), products.get(0).getImageUrl(), products.get(0).getUnit(), products.get(0).getPrice(), 1),
                    new OrderItem(products.get(1).getId(), products.get(1).getName(), products.get(1).getImageUrl(), products.get(1).getUnit(), products.get(1).getPrice(), 2)
            );
            order1.setItems(items1);

            double subtotal1 = items1.stream().mapToDouble(OrderItem::getTotal).sum();
            order1.setSubtotal(subtotal1);
            order1.setDiscount(50.0);
            order1.setCouponCode("FIRST50");
            order1.setDeliveryFee(25.0);
            order1.setTax(Math.round((subtotal1 - 50.0) * 0.05 * 100.0) / 100.0);
            order1.setTotal(Math.round((subtotal1 - 50.0 + 25.0 + order1.getTax()) * 100.0) / 100.0);

            order1.setStatus("OUT_FOR_DELIVERY");
            order1.setDeliveryPartnerName("Vikram Singh");
            order1.setDeliveryPartnerPhone("+91 98765 43210");
            order1.setDriverLat(12.9716);
            order1.setDriverLng(77.5946);
            order1.setEstimatedMinutesRemaining(18);

            order1.getTimeline().add(new OrderStatusLog("PLACED", "Order received and confirmed.", "System"));
            order1.getTimeline().add(new OrderStatusLog("CONFIRMED", "Payment of ₹" + order1.getTotal() + " verified via Razorpay.", "Razorpay Gateway"));
            order1.getTimeline().add(new OrderStatusLog("PACKING", "Picked fresh and packed with cold insulation.", "Warehouse Team"));
            order1.getTimeline().add(new OrderStatusLog("OUT_FOR_DELIVERY", "Delivery partner Vikram Singh is en-route on electric delivery van.", "Dispatch"));

            orderRepository.save(order1);

            // Sample Order 2: DELIVERED
            Order order2 = new Order();
            order2.setOrderNumber("FM-74192033");
            order2.setUserId(customer.getId());
            order2.setCustomerName(customer.getName());
            order2.setCustomerEmail(customer.getEmail());
            order2.setCustomerPhone(customer.getPhone());
            order2.setDeliveryAddress(customer.getAddresses().get(0));
            order2.setDeliverySlot(new DeliverySlot("morning_07_10", "Morning Slot (07:00 AM - 10:00 AM)", "STANDARD", 0.0, "Yesterday"));
            order2.setPaymentMethod("ONLINE_RAZORPAY");
            order2.setPaymentStatus("PAID");

            List<OrderItem> items2 = List.of(
                    new OrderItem(products.get(5).getId(), products.get(5).getName(), products.get(5).getImageUrl(), products.get(5).getUnit(), products.get(5).getPrice(), 2),
                    new OrderItem(products.get(7).getId(), products.get(7).getName(), products.get(7).getImageUrl(), products.get(7).getUnit(), products.get(7).getPrice(), 1)
            );
            order2.setItems(items2);
            double subtotal2 = items2.stream().mapToDouble(OrderItem::getTotal).sum();
            order2.setSubtotal(subtotal2);
            order2.setDiscount(0.0);
            order2.setDeliveryFee(40.0);
            order2.setTax(Math.round(subtotal2 * 0.05 * 100.0) / 100.0);
            order2.setTotal(Math.round((subtotal2 + 40.0 + order2.getTax()) * 100.0) / 100.0);
            order2.setStatus("DELIVERED");
            order2.setEstimatedMinutesRemaining(0);
            order2.getTimeline().add(new OrderStatusLog("PLACED", "Order received.", "System"));
            order2.getTimeline().add(new OrderStatusLog("CONFIRMED", "Order confirmed.", "System"));
            order2.getTimeline().add(new OrderStatusLog("DELIVERED", "Order safely delivered to recipient door.", "Delivery Agent"));

            orderRepository.save(order2);
            logger.info("Seeded sample orders with timeline and driver tracking.");
        }
    }

    private void seedPayments() {
        if (paymentRepository.count() == 0) {
            User customer = userRepository.findByEmail("john@example.com").orElse(null);
            String userId = customer != null ? customer.getId() : "cust_seed";
            String custName = customer != null ? customer.getName() : "John Doe";
            String custEmail = customer != null ? customer.getEmail() : "john@example.com";
            String custPhone = customer != null ? customer.getPhone() : "+91 98877 66554";

            List<Payment> samplePayments = new ArrayList<>();

            // 1. Success - UPI
            Payment p1 = new Payment("order_seed_01", "FM-98421085", userId, custName, custEmail, custPhone,
                    473.0, "INR", "UPI", "ONLINE_RAZORPAY", "SUCCESS");
            p1.setRazorpayOrderId("order_demo_112233");
            p1.setRazorpayPaymentId("pay_demo_success_9988");
            p1.setRazorpaySignature("sig_verified_upi_001");
            p1.setTransactionReference("TXN_UPI_98421085");
            samplePayments.add(p1);

            // 2. Success - Credit Card
            Payment p2 = new Payment("order_seed_02", "FM-74192033", userId, custName, custEmail, custPhone,
                    340.0, "INR", "CREDIT_CARD", "ONLINE_RAZORPAY", "SUCCESS");
            p2.setRazorpayOrderId("order_demo_223344");
            p2.setRazorpayPaymentId("pay_demo_cc_5566");
            p2.setRazorpaySignature("sig_verified_cc_002");
            p2.setTransactionReference("TXN_CC_74192033");
            samplePayments.add(p2);

            // 3. Failed - Debit Card (Insufficient funds)
            Payment p3 = new Payment("order_seed_03", "FM-55129011", userId, custName, custEmail, custPhone,
                    649.0, "INR", "DEBIT_CARD", "ONLINE_RAZORPAY", "FAILED");
            p3.setRazorpayOrderId("order_demo_334455");
            p3.setFailureReason("Transaction declined: Insufficient balance in customer account");
            p3.setTransactionReference("TXN_FAIL_55129011");
            samplePayments.add(p3);

            // 4. Failed - Net Banking (Session timeout)
            Payment p4 = new Payment("order_seed_04", "FM-33091822", userId, custName, custEmail, custPhone,
                    1299.0, "INR", "NET_BANKING", "ONLINE_RAZORPAY", "FAILED");
            p4.setRazorpayOrderId("order_demo_445566");
            p4.setFailureReason("Gateway timeout: Customer exceeded 5-minute NetBanking session limit");
            p4.setTransactionReference("TXN_FAIL_33091822");
            samplePayments.add(p4);

            // 5. Success - Cash on Delivery
            Payment p5 = new Payment("order_seed_05", "FM-11882944", userId, custName, custEmail, custPhone,
                    380.0, "INR", "CASH_ON_DELIVERY", "CASH_ON_DELIVERY", "SUCCESS");
            p5.setTransactionReference("TXN_COD_11882944");
            samplePayments.add(p5);

            // 6. Success - Razorpay Wallet
            Payment p6 = new Payment("order_seed_06", "FM-88220199", userId, custName, custEmail, custPhone,
                    215.0, "INR", "RAZORPAY_WALLET", "ONLINE_RAZORPAY", "SUCCESS");
            p6.setRazorpayOrderId("order_demo_556677");
            p6.setRazorpayPaymentId("pay_demo_wallet_7788");
            p6.setRazorpaySignature("sig_verified_wallet_006");
            p6.setTransactionReference("TXN_WALLET_88220199");
            samplePayments.add(p6);

            paymentRepository.saveAll(samplePayments);
            logger.info("Seeded 6 sample payments across categories (UPI, CREDIT_CARD, DEBIT_CARD, NET_BANKING, RAZORPAY_WALLET, CASH_ON_DELIVERY) with SUCCESS and FAILED statuses.");
        }
    }
}
