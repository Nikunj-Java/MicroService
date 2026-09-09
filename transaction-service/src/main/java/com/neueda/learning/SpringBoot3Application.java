package com.neueda.learning;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;


@SpringBootApplication
@ComponentScan("com.neueda")
public class SpringBoot3Application {

    @Autowired
    static Demo demo;

    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(SpringBoot3Application.class);
        //application.addInitializers(PostgresDatabaseInitializer::initialize);
        application.run(args);
        //Demo demo= new Demo();
        //demo.hello();
//        Demo demo=context.getBean(Demo.class);
        //demo.hello();
    }



}
