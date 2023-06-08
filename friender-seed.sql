-- all test users have the password "password"


INSERT INTO users (username, password, first_name, last_name, email, hobbies, zip_code, radius)
VALUES ('testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User',
        'tesUser@gmail.com',
        'cycling, playing pool, yard work',
        80526,
        50),
       ('testuser2',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User2',
        'tesUser2@gmail.com',
       'swimming, gaming, hydroponics',
        80535,
        15),
        ('testuser3',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User3',
        'tesUser3@gmail.com',
       'drinking wine from the bottle around a campfire, blah blah',
        80535,
        50),
        ('testuser4',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User4',
        'tesUser4@gmail.com',
       'coloring books, crayons, ect',
        95123,
        20);

        INSERT INTO interactions (curr_user, viewed_user, did_like)
        VALUES ('testuser',
        'testuser2',
        'true'
        ),
        (
            'testuser2',
            'testuser',
             'true'
        ),
        (
            'testuser3',
            'testuser',
             'true'
        ),
        (
            'testuser4',
            'testuser',
             'true'
        ),
        (
            'testuser2',
            'testuser3',
             'true'
        ),
        (
            'testuser3',
            'testuser2',
             'false'
        );

        INSERT INTO messages (to_user, from_user, message)
        VALUES ('testuser',
        'testuser2',
        'suh testuser, its test2'
        ),
        ('testuser2',
        'testuser',
        'oi oi oi testuser2, good to hear from yuh'
        ),
        ('testuser',
        'testuser2',
        'oi oi oi right back at yuh testuser'
        ),
        ('testuser2',
        'testuser',
        'broski where you been all my lyfe'
        );