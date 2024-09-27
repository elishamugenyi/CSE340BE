--1. INSERT QUERY INTO ACCOUNT TABLE
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

--2. UPDATE THE ACCOUNT TYPE FOR TONY STARK ENTRY
UPDATE public.account 
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

--3. DELETE RECORD FROM DATABASE
DELETE FROM account
WHERE account_id = 1;

--4.MODIFY GM HUMMER
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

--5. USE INNER JOIN
SELECT inv.inv_make, inv.inv_model, class.classification_name
FROM public.inventory AS inv
INNER JOIN public.classification AS class
ON inv.classification_id = class.classification_id
WHERE class.classification_name = 'Sport';

--6. UPDATE ALL RECORDS TO INCLUDE /VEHICLES IN THE PATH.
UPDATE public.inventory
SET inv_image = regexp_replace(inv_image, '^(/images/)', '/images/vehicles/'),
    inv_thumbnail = regexp_replace(inv_thumbnail, '^(/images/)', '/images/vehicles/');

