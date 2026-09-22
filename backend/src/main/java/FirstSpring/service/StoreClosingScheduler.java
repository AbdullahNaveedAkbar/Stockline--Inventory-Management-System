package FirstSpring.service;

import FirstSpring.dto.AnalyticsSummaryDto;
import FirstSpring.entity.Product;
import FirstSpring.entity.Store;
import FirstSpring.repository.ProductRepository;
import FirstSpring.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StoreClosingScheduler {

    private final EmailTestService emailService;
    private final StoreRepository storeRepository;
    private final AnalyticsService analyticsService;
    private final ProductRepository productRepository;

    @Scheduled(cron = "0 */1 * * * *")
    @Transactional(readOnly = true)
    public void checkAndSendStoreClosingEmails() {
        LocalTime now = LocalTime.now().truncatedTo(ChronoUnit.MINUTES);
        List<Store> stores = storeRepository.findAll();

        for (Store store : stores) {
            LocalTime closingTime = store.getClosedtime();

            if (closingTime != null && closingTime.truncatedTo(ChronoUnit.MINUTES).equals(now)) {
                String recipientEmail = store.getRecipientEmail();

                if (recipientEmail != null && !recipientEmail.isBlank()) {
                    LocalDate today = LocalDate.now();

                    // 1. Fetch overall analytics summary
                    AnalyticsSummaryDto analytics = analyticsService.getDailySummary(today);

                    // 2. Fetch low stock products SPECIFIC to THIS store only (threshold <= 10 units)
                    List<Product> lowStockProducts = productRepository.findByCategoryStoreIdAndStockLessThanEqual(store.getId(), 10);

                    String subject = "🌙 Daily Closing Summary: " + store.getName();
                    String htmlBody = buildHtmlEmailBody(store, closingTime, analytics, lowStockProducts);

                    try {
                        emailService.sendHtmlEmail(recipientEmail, subject, htmlBody);
                        System.out.println("✅ Closing email dispatched for store '" + store.getName() + "' to: " + recipientEmail);
                    } catch (Exception e) {
                        System.err.println("❌ Failed to send closing email for store ID " + store.getId() + ": " + e.getMessage());
                    }
                }
            }
        }
    }
    private String buildHtmlEmailBody(Store store, LocalTime closingTime, AnalyticsSummaryDto analytics, List<Product> lowStockProducts) {

            StringBuilder sb = new StringBuilder();

            String topStoreName = (analytics != null && analytics.getTopStoreName() != null)
                    ? analytics.getTopStoreName()
                    : "N/A";

            // Safely extract BigDecimal and convert to Double for formatting
            Double topStoreRevenue = (analytics != null && analytics.getTopStoreRevenue() != null)
                    ? analytics.getTopStoreRevenue().doubleValue()
                    : 0.0;

            Double totalRevenue = (analytics != null && analytics.getTotalSystemRevenue() != null)
                    ? analytics.getTotalSystemRevenue().doubleValue()
                    : 0.0;

            // ... rest of email building logic remains unchanged

        // Extract recipient store's individual performance from rankings
        Double thisStoreRevenue = 0.0;
        if (analytics != null && analytics.getStoreRankings() != null) {
            thisStoreRevenue = analytics.getStoreRankings().stream()
                    .filter(r -> r.getStoreId().equals(store.getId()))
                    .map(r -> r.getTotalRevenue().doubleValue())
                    .findFirst()
                    .orElse(0.0);
        }


        sb.append("<!DOCTYPE html><html><head><style>")
                .append("body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f9; color: #333; margin: 0; padding: 20px; }")
                .append(".card { background: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 8px; border: 1px solid #e1e8ed; overflow: hidden; }")
                .append(".header { background: #0f2f52; color: #ffffff; padding: 20px; }")
                .append(".header h2 { margin: 0; font-size: 20px; }")
                .append(".content { padding: 20px; }")
                .append(".metrics-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 15px 0; }")
                .append(".top-store-badge { background: #dbeafe; border-left: 4px solid #2563eb; padding: 12px; border-radius: 4px; margin-bottom: 15px; }")
                .append(".table { width: 100%; border-collapse: collapse; margin-top: 10px; }")
                .append(".table th { background: #f1f5f9; text-align: left; padding: 8px; font-size: 12px; color: #475569; }")
                .append(".table td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }")
                .append(".badge-low { background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; }")
                .append(".footer { background: #f8fafc; text-align: center; padding: 12px; font-size: 12px; color: #64748b; }")
                .append("</style></head><body>");

        sb.append("<div class='card'>")
                .append("<div class='header'>")
                .append("<h2>🌙 Store Closing Summary</h2>")
                .append("<p style='margin:4px 0 0; font-size:13px; opacity:0.8;'>").append(store.getName()).append(" | Closed at ").append(closingTime.toString()).append("</p>")
                .append("</div>")

                .append("<div class='content'>")
                .append("<p>Hello,</p>")
                .append("<p>Your store <b>").append(store.getName()).append("</b> has officially closed for the day. Here is today's performance and inventory breakdown:</p>")

                // Top Performing Store Highlight
                .append("<div class='top-store-badge'>")
                .append("<div style='font-size:11px; font-weight:bold; color:#1e40af; text-transform:uppercase;'>🏆 Today's Top Performing Store</div>")
                .append("<div style='font-size:16px; font-weight:bold; color:#1e3a8a; margin-top:2px;'>")
                .append(topStoreName).append(" — <span style='color:#16a34a;'>$").append(String.format("%.2f", topStoreRevenue)).append("</span>")
                .append("</div></div>")


                // Add this right before or inside the metrics-box section:
                .append("<div class='metrics-box' style='background: #f0fdf4; border-color: #bbf7d0;'>")
                .append("<div style='font-size:12px; color:#166534;'>Today's Revenue for ").append(store.getName()).append("</div>")
                .append("<div style='font-size:20px; font-weight:bold; color:#15803d;'>$").append(String.format("%.2f", thisStoreRevenue)).append("</div>")
                .append("</div>")

                // System Metrics Overview
                .append("<div class='metrics-box'>")
                .append("<div style='font-size:12px; color:#64748b;'>Total System Revenue Today</div>")
                .append("<div style='font-size:20px; font-weight:bold; color:#0f2f52;'>$").append(String.format("%.2f", totalRevenue)).append("</div>")
                .append("</div>")

                // Low Stock Alerts
                .append("<h4 style='margin:20px 0 8px; color:#991b1b;'>⚠️ Low Stock Inventory Alert</h4>");

        if (lowStockProducts != null && !lowStockProducts.isEmpty()) {
            sb.append("<table class='table'>")
                    .append("<thead><tr><th>Product</th><th style='text-align:right;'>Price</th><th style='text-align:right;'>Stock Left</th></tr></thead>")
                    .append("<tbody>");

            for (Product p : lowStockProducts) {
                sb.append("<tr>")
                        .append("<td><b>").append(p.getName()).append("</b></td>")
                        .append("<td style='text-align:right;'>$").append(String.format("%.2f", p.getPrice())).append("</td>")
                        .append("<td style='text-align:right;'><span class='badge-low'>").append(p.getStock()).append(" units</span></td>")
                        .append("</tr>");


            }
            sb.append("</tbody></table>");
        } else {
            sb.append("<p style='font-size:13px; color:#16a34a; margin:0;'>All product inventory levels are currently sufficient.</p>");
        }

        sb.append("<p style='margin-top:20px;'>Please review your dashboard to process final inventory logs and sales reports.</p>")
                .append("</div>")

                .append("<div class='footer'>")
                .append("Best regards,<br><b>Stockline Operations Team</b>")
                .append("</div></div></body></html>");



        return sb.toString();
    }
}