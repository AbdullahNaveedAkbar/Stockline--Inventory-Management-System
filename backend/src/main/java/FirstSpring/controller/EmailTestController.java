package FirstSpring.controller;

import FirstSpring.service.EmailTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class EmailTestController {

    private final EmailTestService emailTestService;

    @GetMapping("/send-email")
    public String sendEmail(@RequestParam String to) {

        return "Email sent to " + to;
    }
}