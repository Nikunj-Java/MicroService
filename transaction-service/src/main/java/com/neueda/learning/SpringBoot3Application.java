package com.neueda.learning;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class SpringBoot3Application {

    @Autowired
    static Demo demo;

    public static void main(String[] args) {
        var context= SpringApplication.run(SpringBoot3Application.class, args);
        //Demo demo= new Demo();
        //demo.hello();
//        Demo demo=context.getBean(Demo.class);
        //demo.hello();
    }

}
