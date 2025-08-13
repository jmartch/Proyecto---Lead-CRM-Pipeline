CREATE DATABASE IF NOT EXISTS lead_crm;

USE lead_crm;

CREATE TABLE
    IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        telefono VARCHAR(50),
        origen VARCHAR(100),
        campaña VARCHAR(100),
        ciudad VARCHAR(50),
        responsable VARCHAR(100),
        estado ENUM (
            'nuevo',
            'contactado',
            'en_negociacion',
            'cerrado_ganado',
            'cerrado_perdido'
        ) DEFAULT 'nuevo',
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        rol ENUM ('admin', 'ejecutivo', 'marketing') DEFAULT 'ejecutivo',
        creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );