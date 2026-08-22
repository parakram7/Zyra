-- Zyra sample data — four teams, a squad each, a competition,
-- and a run of matches (finished, one live, some upcoming).
-- Paste into the Supabase SQL Editor AFTER schema.sql has been run.
-- Safe to re-run: existing rows with the same id are left alone.

insert into organizations (id, name, city) values
  ('org-riverside-demo', 'Riverside School District', 'Pune')
on conflict (id) do nothing;

insert into teams (id, name, short_name, crest_color_from, crest_color_to, founded_year, home_ground, city, category) values
  ('team-riverside', 'Riverside Academy', 'RIV', '#34d399', '#047857', 2011, 'Riverside Turf Ground', 'Pune', 'U16 Boys'),
  ('team-lakeside', 'Lakeside United', 'LAK', '#60a5fa', '#1d4ed8', 2008, 'Lakeside Community Ground', 'Pune', 'U16 Boys'),
  ('team-eastwood', 'Eastwood Rangers', 'EWR', '#fb923c', '#c2410c', 2014, 'Eastwood School Ground', 'Pune', 'U16 Boys'),
  ('team-northgate', 'Northgate Warriors', 'NGW', '#a78bfa', '#6d28d9', 2016, 'Northgate Sports Complex', 'Pimpri-Chinchwad', 'U16 Boys')
on conflict (id) do nothing;

insert into players (id, team_id, name, short_name, shirt_number, position, preferred_foot, date_of_birth, category, nationality, bio) values
  ('p-rohan-deshmukh', 'team-riverside', 'Rohan Deshmukh', 'Deshmukh', 1, 'GK', 'Right', '2009-03-14', 'U16', 'India', 'Commanding shot-stopper with excellent distribution off the deck.'),
  ('p-kabir-nair', 'team-riverside', 'Kabir Nair', 'Nair', 12, 'GK', 'Right', '2009-11-02', 'U16', 'India', null),
  ('p-yuvraj-chauhan', 'team-riverside', 'Yuvraj Chauhan', 'Chauhan', 2, 'DF', 'Right', '2009-06-21', 'U16', 'India', 'Reliable right-back who loves to overlap down the flank.'),
  ('p-aditya-raut', 'team-riverside', 'Aditya Raut', 'Raut', 3, 'DF', 'Left', '2008-12-30', 'U16', 'India', null),
  ('p-vihaan-kulkarni', 'team-riverside', 'Vihaan Kulkarni', 'Kulkarni', 4, 'DF', 'Right', '2009-01-18', 'U16', 'India', 'Vice-captain. Composed centre-back, strong in the air.'),
  ('p-siddharth-menon', 'team-riverside', 'Siddharth Menon', 'Menon', 5, 'DF', 'Right', '2009-08-09', 'U16', 'India', null),
  ('p-devansh-rathore', 'team-riverside', 'Devansh Rathore', 'Rathore', 14, 'DF', 'Left', '2009-05-27', 'U16', 'India', null),
  ('p-arjun-pillai', 'team-riverside', 'Arjun Pillai', 'Pillai', 15, 'DF', 'Right', '2010-02-11', 'U16', 'India', null),
  ('p-aryan-sharma', 'team-riverside', 'Aryan Sharma', 'Aryan', 8, 'MF', 'Right', '2009-04-05', 'U16', 'India', 'Creative playmaker — the engine of Riverside''s midfield.'),
  ('p-kartik-iyer', 'team-riverside', 'Kartik Iyer', 'Iyer', 6, 'MF', 'Right', '2009-09-16', 'U16', 'India', null),
  ('p-rudra-singh', 'team-riverside', 'Rudra Pratap Singh', 'Rudra', 16, 'MF', 'Right', '2008-10-23', 'U16', 'India', null),
  ('p-ishaan-bhatt', 'team-riverside', 'Ishaan Bhatt', 'Bhatt', 17, 'MF', 'Left', '2009-07-08', 'U16', 'India', null),
  ('p-shaurya-malhotra', 'team-riverside', 'Shaurya Malhotra', 'Malhotra', 18, 'MF', 'Right', '2010-01-30', 'U16', 'India', null),
  ('p-reyansh-joshi', 'team-riverside', 'Reyansh Joshi', 'Joshi', 19, 'MF', 'Right', '2009-12-19', 'U16', 'India', null),
  ('p-parakram-baheti', 'team-riverside', 'Parakram Baheti', 'Baheti', 9, 'FW', 'Right', '2009-02-27', 'U16', 'India', 'Captain and top scorer. Clinical finisher with a fierce right foot.'),
  ('p-vivaan-khanna', 'team-riverside', 'Vivaan Khanna', 'Khanna', 11, 'FW', 'Left', '2009-06-13', 'U16', 'India', 'Pacey inverted winger who cuts in from the left.'),
  ('p-advik-trivedi', 'team-riverside', 'Advik Trivedi', 'Trivedi', 10, 'FW', 'Right', '2008-11-11', 'U16', 'India', null),
  ('p-neel-kapadia', 'team-riverside', 'Neel Kapadia', 'Kapadia', 20, 'FW', 'Right', '2010-03-22', 'U16', 'India', null),
  ('p-om-yadav', 'team-riverside', 'Om Prakash Yadav', 'Yadav', 13, 'DF', 'Right', '2010-04-04', 'U16', 'India', null),
  ('p-dhruv-saxena', 'team-riverside', 'Dhruv Saxena', 'Saxena', 7, 'MF', 'Left', '2009-10-01', 'U16', 'India', null),
  ('team-lakeside-p1', 'team-lakeside', 'Aditya Mishra', 'Mishra', 1, 'GK', 'Right', '2010-03-03', 'U16', 'India', null),
  ('team-lakeside-p2', 'team-lakeside', 'Vihaan Grover', 'Grover', 2, 'GK', 'Right', '2008-04-04', 'U16', 'India', null),
  ('team-lakeside-p3', 'team-lakeside', 'Arjun Shah', 'Shah', 3, 'DF', 'Right', '2009-05-05', 'U16', 'India', null),
  ('team-lakeside-p4', 'team-lakeside', 'Sai Sengupta', 'Sengupta', 4, 'DF', 'Left', '2010-06-06', 'U16', 'India', null),
  ('team-lakeside-p5', 'team-lakeside', 'Reyansh Mishra', 'Mishra', 5, 'DF', 'Right', '2008-07-07', 'U16', 'India', null),
  ('team-lakeside-p6', 'team-lakeside', 'Ayaan Grover', 'Grover', 6, 'DF', 'Right', '2009-08-08', 'U16', 'India', null),
  ('team-lakeside-p7', 'team-lakeside', 'Krishna Shah', 'Shah', 7, 'DF', 'Right', '2010-09-09', 'U16', 'India', null),
  ('team-lakeside-p8', 'team-lakeside', 'Ishaan Sengupta', 'Sengupta', 8, 'MF', 'Both', '2008-10-10', 'U16', 'India', null),
  ('team-lakeside-p9', 'team-lakeside', 'Shaurya Mishra', 'Mishra', 9, 'MF', 'Left', '2009-11-11', 'U16', 'India', null),
  ('team-lakeside-p10', 'team-lakeside', 'Atharv Grover', 'Grover', 10, 'MF', 'Right', '2010-12-12', 'U16', 'India', null),
  ('team-lakeside-p11', 'team-lakeside', 'Advik Shah', 'Shah', 11, 'MF', 'Right', '2008-01-13', 'U16', 'India', null),
  ('team-lakeside-p12', 'team-lakeside', 'Ranveer Sengupta', 'Sengupta', 12, 'FW', 'Right', '2009-02-14', 'U16', 'India', null),
  ('team-lakeside-p13', 'team-lakeside', 'Ansh Mishra', 'Mishra', 13, 'FW', 'Right', '2010-03-15', 'U16', 'India', null),
  ('team-lakeside-p14', 'team-lakeside', 'Dev Grover', 'Grover', 14, 'FW', 'Left', '2008-04-16', 'U16', 'India', null),
  ('team-eastwood-p1', 'team-eastwood', 'Atharv Grover', 'Grover', 1, 'GK', 'Right', '2010-12-12', 'U16', 'India', null),
  ('team-eastwood-p2', 'team-eastwood', 'Advik Shah', 'Shah', 2, 'GK', 'Right', '2008-01-13', 'U16', 'India', null),
  ('team-eastwood-p3', 'team-eastwood', 'Ranveer Sengupta', 'Sengupta', 3, 'DF', 'Right', '2009-02-14', 'U16', 'India', null),
  ('team-eastwood-p4', 'team-eastwood', 'Ansh Mishra', 'Mishra', 4, 'DF', 'Right', '2010-03-15', 'U16', 'India', null),
  ('team-eastwood-p5', 'team-eastwood', 'Dev Grover', 'Grover', 5, 'DF', 'Left', '2008-04-16', 'U16', 'India', null),
  ('team-eastwood-p6', 'team-eastwood', 'Yash Shah', 'Shah', 6, 'DF', 'Right', '2009-05-17', 'U16', 'India', null),
  ('team-eastwood-p7', 'team-eastwood', 'Karan Sengupta', 'Sengupta', 7, 'DF', 'Right', '2010-06-18', 'U16', 'India', null),
  ('team-eastwood-p8', 'team-eastwood', 'Nikhil Mishra', 'Mishra', 8, 'MF', 'Both', '2008-07-19', 'U16', 'India', null),
  ('team-eastwood-p9', 'team-eastwood', 'Harsh Grover', 'Grover', 9, 'MF', 'Right', '2009-08-20', 'U16', 'India', null),
  ('team-eastwood-p10', 'team-eastwood', 'Manav Shah', 'Shah', 10, 'MF', 'Left', '2010-09-21', 'U16', 'India', null),
  ('team-eastwood-p11', 'team-eastwood', 'Veer Sengupta', 'Sengupta', 11, 'MF', 'Right', '2008-10-22', 'U16', 'India', null),
  ('team-eastwood-p12', 'team-eastwood', 'Pranav Mishra', 'Mishra', 12, 'FW', 'Right', '2009-11-23', 'U16', 'India', null),
  ('team-eastwood-p13', 'team-eastwood', 'Raghav Grover', 'Grover', 13, 'FW', 'Right', '2010-12-24', 'U16', 'India', null),
  ('team-eastwood-p14', 'team-eastwood', 'Samar Shah', 'Shah', 14, 'FW', 'Right', '2008-01-25', 'U16', 'India', null),
  ('team-northgate-p1', 'team-northgate', 'Manav Shah', 'Shah', 1, 'GK', 'Left', '2010-09-21', 'U16', 'India', null),
  ('team-northgate-p2', 'team-northgate', 'Veer Sengupta', 'Sengupta', 2, 'GK', 'Right', '2008-10-22', 'U16', 'India', null),
  ('team-northgate-p3', 'team-northgate', 'Pranav Mishra', 'Mishra', 3, 'DF', 'Right', '2009-11-23', 'U16', 'India', null),
  ('team-northgate-p4', 'team-northgate', 'Raghav Grover', 'Grover', 4, 'DF', 'Right', '2010-12-24', 'U16', 'India', null),
  ('team-northgate-p5', 'team-northgate', 'Samar Shah', 'Shah', 5, 'DF', 'Right', '2008-01-25', 'U16', 'India', null),
  ('team-northgate-p6', 'team-northgate', 'Tanish Sengupta', 'Sengupta', 6, 'DF', 'Left', '2009-02-26', 'U16', 'India', null),
  ('team-northgate-p7', 'team-northgate', 'Yug Mishra', 'Mishra', 7, 'DF', 'Right', '2010-03-27', 'U16', 'India', null),
  ('team-northgate-p8', 'team-northgate', 'Zayn Grover', 'Grover', 8, 'MF', 'Both', '2008-04-01', 'U16', 'India', null),
  ('team-northgate-p9', 'team-northgate', 'Kabir Shah', 'Shah', 9, 'MF', 'Right', '2009-05-02', 'U16', 'India', null),
  ('team-northgate-p10', 'team-northgate', 'Laksh Sengupta', 'Sengupta', 10, 'MF', 'Right', '2010-06-03', 'U16', 'India', null),
  ('team-northgate-p11', 'team-northgate', 'Aarav Mishra', 'Mishra', 11, 'MF', 'Left', '2008-07-04', 'U16', 'India', null),
  ('team-northgate-p12', 'team-northgate', 'Vivan Grover', 'Grover', 12, 'FW', 'Right', '2009-08-05', 'U16', 'India', null),
  ('team-northgate-p13', 'team-northgate', 'Aditya Shah', 'Shah', 13, 'FW', 'Right', '2010-09-06', 'U16', 'India', null),
  ('team-northgate-p14', 'team-northgate', 'Vihaan Sengupta', 'Sengupta', 14, 'FW', 'Right', '2008-10-07', 'U16', 'India', null)
on conflict (id) do nothing;

insert into competitions (id, name, season, format) values
  ('comp-metro-youth-league', 'Metro Youth League', '2025/26', 'league')
on conflict (id) do nothing;

insert into competition_teams (competition_id, team_id) values
  ('comp-metro-youth-league', 'team-riverside'),
  ('comp-metro-youth-league', 'team-lakeside'),
  ('comp-metro-youth-league', 'team-eastwood'),
  ('comp-metro-youth-league', 'team-northgate')
on conflict do nothing;

insert into matches (id, competition_id, home_team_id, away_team_id, date, venue, status, duration_minutes, half_length_minutes, current_minute, current_half, home_score, away_score, home_lineup, away_lineup, clock_running, clock_started_at, clock_base_minute) values
  ('match-riv-lak-1', 'comp-metro-youth-league', 'team-riverside', 'team-lakeside', '2026-07-24T16:30:00.000Z', 'Riverside Turf Ground', 'COMPLETED', 70, 35, 70, 'FT', 3, 1, '{"startingXI":[{"playerId":"p-rohan-deshmukh","position":"GK"},{"playerId":"p-parakram-baheti","position":"FW"},{"playerId":"p-aryan-sharma","position":"MF"},{"playerId":"p-vivaan-khanna","position":"FW"},{"playerId":"p-advik-trivedi","position":"FW"},{"playerId":"p-yuvraj-chauhan","position":"DF"},{"playerId":"p-aditya-raut","position":"DF"},{"playerId":"p-vihaan-kulkarni","position":"DF"},{"playerId":"p-siddharth-menon","position":"DF"},{"playerId":"p-devansh-rathore","position":"DF"},{"playerId":"p-arjun-pillai","position":"DF"}],"substitutes":["p-kabir-nair","p-kartik-iyer","p-rudra-singh","p-ishaan-bhatt","p-shaurya-malhotra","p-reyansh-joshi","p-neel-kapadia","p-om-yadav","p-dhruv-saxena"],"captainId":"p-parakram-baheti","goalkeeperId":"p-rohan-deshmukh"}'::jsonb, '{"startingXI":[{"playerId":"team-lakeside-p1","position":"GK"},{"playerId":"team-lakeside-p3","position":"DF"},{"playerId":"team-lakeside-p5","position":"DF"},{"playerId":"team-lakeside-p10","position":"MF"},{"playerId":"team-lakeside-p4","position":"DF"},{"playerId":"team-lakeside-p6","position":"DF"},{"playerId":"team-lakeside-p7","position":"DF"},{"playerId":"team-lakeside-p8","position":"MF"},{"playerId":"team-lakeside-p9","position":"MF"},{"playerId":"team-lakeside-p11","position":"MF"},{"playerId":"team-lakeside-p12","position":"FW"}],"substitutes":["team-lakeside-p2","team-lakeside-p13","team-lakeside-p14"],"captainId":"team-lakeside-p3","goalkeeperId":"team-lakeside-p1"}'::jsonb, false, null, 70),
  ('match-ewr-riv-1', 'comp-metro-youth-league', 'team-eastwood', 'team-riverside', '2026-07-31T16:30:00.000Z', 'Eastwood School Ground', 'COMPLETED', 80, 40, 80, 'FT', 0, 2, '{"startingXI":[{"playerId":"team-eastwood-p1","position":"GK"},{"playerId":"team-eastwood-p2","position":"GK"},{"playerId":"team-eastwood-p7","position":"DF"},{"playerId":"team-eastwood-p11","position":"MF"},{"playerId":"team-eastwood-p4","position":"DF"},{"playerId":"team-eastwood-p3","position":"DF"},{"playerId":"team-eastwood-p5","position":"DF"},{"playerId":"team-eastwood-p6","position":"DF"},{"playerId":"team-eastwood-p8","position":"MF"},{"playerId":"team-eastwood-p9","position":"MF"},{"playerId":"team-eastwood-p10","position":"MF"}],"substitutes":["team-eastwood-p12","team-eastwood-p13","team-eastwood-p14"],"captainId":"team-eastwood-p2","goalkeeperId":"team-eastwood-p1"}'::jsonb, '{"startingXI":[{"playerId":"p-rohan-deshmukh","position":"GK"},{"playerId":"p-parakram-baheti","position":"FW"},{"playerId":"p-advik-trivedi","position":"FW"},{"playerId":"p-dhruv-saxena","position":"MF"},{"playerId":"p-kartik-iyer","position":"MF"},{"playerId":"p-vivaan-khanna","position":"FW"},{"playerId":"p-yuvraj-chauhan","position":"DF"},{"playerId":"p-aditya-raut","position":"DF"},{"playerId":"p-vihaan-kulkarni","position":"DF"},{"playerId":"p-siddharth-menon","position":"DF"},{"playerId":"p-devansh-rathore","position":"DF"}],"substitutes":["p-kabir-nair","p-arjun-pillai","p-aryan-sharma","p-rudra-singh","p-ishaan-bhatt","p-shaurya-malhotra","p-reyansh-joshi","p-neel-kapadia","p-om-yadav"],"captainId":"p-parakram-baheti","goalkeeperId":"p-rohan-deshmukh"}'::jsonb, false, null, 80),
  ('match-ngw-lak-1', 'comp-metro-youth-league', 'team-northgate', 'team-lakeside', '2026-08-04T16:30:00.000Z', 'Northgate Sports Complex', 'COMPLETED', 70, 35, 70, 'FT', 1, 1, '{"startingXI":[{"playerId":"team-northgate-p1","position":"GK"},{"playerId":"team-northgate-p3","position":"DF"},{"playerId":"team-northgate-p10","position":"MF"},{"playerId":"team-northgate-p9","position":"MF"},{"playerId":"team-northgate-p4","position":"DF"},{"playerId":"team-northgate-p5","position":"DF"},{"playerId":"team-northgate-p6","position":"DF"},{"playerId":"team-northgate-p7","position":"DF"},{"playerId":"team-northgate-p8","position":"MF"},{"playerId":"team-northgate-p11","position":"MF"},{"playerId":"team-northgate-p12","position":"FW"}],"substitutes":["team-northgate-p2","team-northgate-p13","team-northgate-p14"],"captainId":"team-northgate-p3","goalkeeperId":"team-northgate-p1"}'::jsonb, '{"startingXI":[{"playerId":"team-lakeside-p1","position":"GK"},{"playerId":"team-lakeside-p3","position":"DF"},{"playerId":"team-lakeside-p10","position":"MF"},{"playerId":"team-lakeside-p4","position":"DF"},{"playerId":"team-lakeside-p5","position":"DF"},{"playerId":"team-lakeside-p6","position":"DF"},{"playerId":"team-lakeside-p7","position":"DF"},{"playerId":"team-lakeside-p8","position":"MF"},{"playerId":"team-lakeside-p9","position":"MF"},{"playerId":"team-lakeside-p11","position":"MF"},{"playerId":"team-lakeside-p12","position":"FW"}],"substitutes":["team-lakeside-p2","team-lakeside-p13","team-lakeside-p14"],"captainId":"team-lakeside-p3","goalkeeperId":"team-lakeside-p1"}'::jsonb, false, null, 70),
  ('match-riv-ngw-1', 'comp-metro-youth-league', 'team-riverside', 'team-northgate', '2026-08-09T16:30:00.000Z', 'Riverside Turf Ground', 'COMPLETED', 70, 35, 70, 'FT', 4, 0, '{"startingXI":[{"playerId":"p-rohan-deshmukh","position":"GK"},{"playerId":"p-parakram-baheti","position":"FW"},{"playerId":"p-aryan-sharma","position":"MF"},{"playerId":"p-vivaan-khanna","position":"FW"},{"playerId":"p-advik-trivedi","position":"FW"},{"playerId":"p-yuvraj-chauhan","position":"DF"},{"playerId":"p-aditya-raut","position":"DF"},{"playerId":"p-vihaan-kulkarni","position":"DF"},{"playerId":"p-siddharth-menon","position":"DF"},{"playerId":"p-devansh-rathore","position":"DF"},{"playerId":"p-arjun-pillai","position":"DF"}],"substitutes":["p-kabir-nair","p-kartik-iyer","p-rudra-singh","p-ishaan-bhatt","p-shaurya-malhotra","p-reyansh-joshi","p-neel-kapadia","p-om-yadav","p-dhruv-saxena"],"captainId":"p-parakram-baheti","goalkeeperId":"p-rohan-deshmukh"}'::jsonb, '{"startingXI":[{"playerId":"team-northgate-p1","position":"GK"},{"playerId":"team-northgate-p3","position":"DF"},{"playerId":"team-northgate-p5","position":"DF"},{"playerId":"team-northgate-p4","position":"DF"},{"playerId":"team-northgate-p6","position":"DF"},{"playerId":"team-northgate-p7","position":"DF"},{"playerId":"team-northgate-p8","position":"MF"},{"playerId":"team-northgate-p9","position":"MF"},{"playerId":"team-northgate-p10","position":"MF"},{"playerId":"team-northgate-p11","position":"MF"},{"playerId":"team-northgate-p12","position":"FW"}],"substitutes":["team-northgate-p2","team-northgate-p13","team-northgate-p14"],"captainId":"team-northgate-p3","goalkeeperId":"team-northgate-p1"}'::jsonb, false, null, 70),
  ('match-riv-ewr-live', 'comp-metro-youth-league', 'team-riverside', 'team-eastwood', '2026-08-14T10:00:00.000Z', 'Riverside Turf Ground', 'LIVE', 70, 35, 55, '2', 2, 1, '{"startingXI":[{"playerId":"p-rohan-deshmukh","position":"GK"},{"playerId":"p-parakram-baheti","position":"FW"},{"playerId":"p-aryan-sharma","position":"MF"},{"playerId":"p-vivaan-khanna","position":"FW"},{"playerId":"p-dhruv-saxena","position":"MF"},{"playerId":"p-reyansh-joshi","position":"MF"},{"playerId":"p-yuvraj-chauhan","position":"DF"},{"playerId":"p-aditya-raut","position":"DF"},{"playerId":"p-vihaan-kulkarni","position":"DF"},{"playerId":"p-siddharth-menon","position":"DF"},{"playerId":"p-devansh-rathore","position":"DF"}],"substitutes":["p-kabir-nair","p-arjun-pillai","p-kartik-iyer","p-rudra-singh","p-ishaan-bhatt","p-shaurya-malhotra","p-advik-trivedi","p-neel-kapadia","p-om-yadav"],"captainId":"p-parakram-baheti","goalkeeperId":"p-rohan-deshmukh"}'::jsonb, '{"startingXI":[{"playerId":"team-eastwood-p1","position":"GK"},{"playerId":"team-eastwood-p2","position":"GK"},{"playerId":"team-eastwood-p6","position":"DF"},{"playerId":"team-eastwood-p10","position":"MF"},{"playerId":"team-eastwood-p9","position":"MF"},{"playerId":"team-eastwood-p3","position":"DF"},{"playerId":"team-eastwood-p4","position":"DF"},{"playerId":"team-eastwood-p5","position":"DF"},{"playerId":"team-eastwood-p7","position":"DF"},{"playerId":"team-eastwood-p8","position":"MF"},{"playerId":"team-eastwood-p11","position":"MF"}],"substitutes":["team-eastwood-p12","team-eastwood-p13","team-eastwood-p14"],"captainId":"team-eastwood-p2","goalkeeperId":"team-eastwood-p1"}'::jsonb, false, null, 55),
  ('match-lak-riv-upcoming', 'comp-metro-youth-league', 'team-lakeside', 'team-riverside', '2026-08-18T16:00:00.000Z', 'Lakeside Community Ground', 'SCHEDULED', 70, 35, 0, null, 0, 0, null, null, false, null, 0),
  ('match-riv-ngw-upcoming', 'comp-metro-youth-league', 'team-riverside', 'team-northgate', '2026-08-25T15:30:00.000Z', 'Riverside Turf Ground', 'SCHEDULED', 70, 35, 0, null, 0, 0, null, null, false, null, 0),
  ('match-ewr-ngw-upcoming', 'comp-metro-youth-league', 'team-eastwood', 'team-northgate', '2026-09-01T17:00:00.000Z', 'Eastwood School Ground', 'SCHEDULED', 70, 35, 0, null, 0, 0, null, null, false, null, 0)
on conflict (id) do nothing;

insert into match_events (id, match_id, type, minute, half, team_id, player_id, secondary_player_id, note) values
  ('evt-match-riv-lak-1-1', 'match-riv-lak-1', 'KICK_OFF', 0, 1, null, null, null, null),
  ('evt-match-riv-lak-1-2', 'match-riv-lak-1', 'GOAL', 12, 1, 'team-riverside', 'p-parakram-baheti', 'p-aryan-sharma', null),
  ('evt-match-riv-lak-1-3', 'match-riv-lak-1', 'YELLOW_CARD', 24, 1, 'team-lakeside', 'team-lakeside-p5', null, null),
  ('evt-match-riv-lak-1-4', 'match-riv-lak-1', 'GOAL', 31, 1, 'team-lakeside', 'team-lakeside-p10', 'team-lakeside-p4', null),
  ('evt-match-riv-lak-1-5', 'match-riv-lak-1', 'GOAL', 52, 2, 'team-riverside', 'p-vivaan-khanna', 'p-aryan-sharma', null),
  ('evt-match-riv-lak-1-6', 'match-riv-lak-1', 'SUBSTITUTION', 58, 2, 'team-riverside', 'p-advik-trivedi', 'p-neel-kapadia', null),
  ('evt-match-riv-lak-1-7', 'match-riv-lak-1', 'GOAL', 67, 2, 'team-riverside', 'p-parakram-baheti', null, null),
  ('evt-match-riv-lak-1-8', 'match-riv-lak-1', 'FULL_TIME', 70, 2, null, null, null, null),
  ('evt-match-ewr-riv-1-9', 'match-ewr-riv-1', 'KICK_OFF', 0, 1, null, null, null, null),
  ('evt-match-ewr-riv-1-10', 'match-ewr-riv-1', 'GOAL', 19, 1, 'team-riverside', 'p-advik-trivedi', 'p-dhruv-saxena', null),
  ('evt-match-ewr-riv-1-11', 'match-ewr-riv-1', 'YELLOW_CARD', 38, 1, 'team-riverside', 'p-kartik-iyer', null, null),
  ('evt-match-ewr-riv-1-12', 'match-ewr-riv-1', 'YELLOW_CARD', 44, 2, 'team-eastwood', 'team-eastwood-p7', null, null),
  ('evt-match-ewr-riv-1-13', 'match-ewr-riv-1', 'SUBSTITUTION', 55, 2, 'team-eastwood', 'team-eastwood-p11', 'team-eastwood-p12', null),
  ('evt-match-ewr-riv-1-14', 'match-ewr-riv-1', 'GOAL', 74, 2, 'team-riverside', 'p-parakram-baheti', 'p-vivaan-khanna', null),
  ('evt-match-ewr-riv-1-15', 'match-ewr-riv-1', 'RED_CARD', 81, 2, 'team-eastwood', 'team-eastwood-p4', null, null),
  ('evt-match-ewr-riv-1-16', 'match-ewr-riv-1', 'FULL_TIME', 80, 2, null, null, null, null),
  ('evt-match-ngw-lak-1-17', 'match-ngw-lak-1', 'KICK_OFF', 0, 1, null, null, null, null),
  ('evt-match-ngw-lak-1-18', 'match-ngw-lak-1', 'GOAL', 22, 1, 'team-northgate', 'team-northgate-p10', 'team-northgate-p9', null),
  ('evt-match-ngw-lak-1-19', 'match-ngw-lak-1', 'GOAL', 63, 2, 'team-lakeside', 'team-lakeside-p10', null, null),
  ('evt-match-ngw-lak-1-20', 'match-ngw-lak-1', 'FULL_TIME', 70, 2, null, null, null, null),
  ('evt-match-riv-ngw-1-21', 'match-riv-ngw-1', 'KICK_OFF', 0, 1, null, null, null, null),
  ('evt-match-riv-ngw-1-22', 'match-riv-ngw-1', 'GOAL', 8, 1, 'team-riverside', 'p-parakram-baheti', 'p-aryan-sharma', null),
  ('evt-match-riv-ngw-1-23', 'match-riv-ngw-1', 'GOAL', 21, 1, 'team-riverside', 'p-vivaan-khanna', 'p-parakram-baheti', null),
  ('evt-match-riv-ngw-1-24', 'match-riv-ngw-1', 'OWN_GOAL', 35, 1, 'team-northgate', 'team-northgate-p5', null, null),
  ('evt-match-riv-ngw-1-25', 'match-riv-ngw-1', 'SUBSTITUTION', 60, 2, 'team-riverside', 'p-aryan-sharma', 'p-dhruv-saxena', null),
  ('evt-match-riv-ngw-1-26', 'match-riv-ngw-1', 'GOAL', 69, 2, 'team-riverside', 'p-parakram-baheti', 'p-advik-trivedi', null),
  ('evt-match-riv-ngw-1-27', 'match-riv-ngw-1', 'FULL_TIME', 70, 2, null, null, null, null),
  ('evt-match-riv-ewr-live-28', 'match-riv-ewr-live', 'KICK_OFF', 0, 1, null, null, null, null),
  ('evt-match-riv-ewr-live-29', 'match-riv-ewr-live', 'GOAL', 9, 1, 'team-riverside', 'p-parakram-baheti', 'p-aryan-sharma', null),
  ('evt-match-riv-ewr-live-30', 'match-riv-ewr-live', 'YELLOW_CARD', 26, 1, 'team-eastwood', 'team-eastwood-p6', null, null),
  ('evt-match-riv-ewr-live-31', 'match-riv-ewr-live', 'GOAL', 33, 1, 'team-eastwood', 'team-eastwood-p10', 'team-eastwood-p9', null),
  ('evt-match-riv-ewr-live-32', 'match-riv-ewr-live', 'GOAL', 51, 2, 'team-riverside', 'p-vivaan-khanna', 'p-dhruv-saxena', null),
  ('evt-match-riv-ewr-live-33', 'match-riv-ewr-live', 'SUBSTITUTION', 55, 2, 'team-riverside', 'p-reyansh-joshi', 'p-shaurya-malhotra', null)
on conflict (id) do nothing;

-- Attach everything above to the demo organization (only touches rows that
-- don't already belong to one, so this is safe to re-run).
update teams set org_id = 'org-riverside-demo'
  where org_id is null and id in ('team-riverside', 'team-lakeside', 'team-eastwood', 'team-northgate');
update competitions set org_id = 'org-riverside-demo'
  where org_id is null and id = 'comp-metro-youth-league';
update matches set org_id = 'org-riverside-demo'
  where org_id is null and competition_id = 'comp-metro-youth-league';
