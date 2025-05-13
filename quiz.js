
        // Initialize vote tracking
        let votes = {
            vision: 0,
            hearing: 0,
            smell: 0,
            taste: 0,
            touch: 0
        };
        
        // Flag to track if current user has voted
        let hasVoted = false;
        let userSelection = null;
        
        // Try to load existing votes and user status from localStorage
        try {
            const savedVotes = localStorage.getItem('sensoryQuizVotes');
            if (savedVotes) {
                votes = JSON.parse(savedVotes);
            }
            
            // Check if this user has already voted
            hasVoted = localStorage.getItem('sensoryQuizUserVoted') === 'true';
            userSelection = localStorage.getItem('sensoryQuizUserSelection');
            
            // Update UI based on loaded data
            updateVoteCounts();
            updateStatsBar();
            
            // If user has already voted, highlight their selection
            if (hasVoted && userSelection) {
                const selectedOption = document.querySelector(`.quiz-option[data-sense="${userSelection}"]`);
                if (selectedOption) {
                    selectedOption.classList.add('selected');
                }
            }
            
            // Update quiz options state based on whether user has voted
            updateQuizState();
        } catch (e) {
            console.error("Error loading saved votes:", e);
        }
        
        // Add event listeners to quiz options
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', function() {
                // If user has already voted, don't allow another vote
                if (hasVoted) {
                    showMessage("You've already voted! Only one vote per person is allowed.");
                    return;
                }
                
                // Get the selected sense
                const sense = this.getAttribute('data-sense');
                
                // Mark as selected
                document.querySelectorAll('.quiz-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
                
                // Increment vote count
                votes[sense]++;
                
                // Save to localStorage
                localStorage.setItem('sensoryQuizVotes', JSON.stringify(votes));
                
                // Mark that this user has voted
                localStorage.setItem('sensoryQuizUserVoted', 'true');
                localStorage.setItem('sensoryQuizUserSelection', sense);
                hasVoted = true;
                userSelection = sense;
                
                // Update UI
                updateVoteCounts();
                updateStatsBar();
                updateQuizState();
                
                // Create confetti effect for the selected sense
                createConfetti(this);
            });
        });
        
        // Function to show a temporary message
        function showMessage(text) {
            // Check if a message already exists
            let messageElement = document.querySelector('.quiz-message');
            
            // If not, create one
            if (!messageElement) {
                messageElement = document.createElement('div');
                messageElement.className = 'quiz-message';
                messageElement.style.backgroundColor = '#ffeb3b';
                messageElement.style.color = '#333';
                messageElement.style.padding = '10px';
                messageElement.style.borderRadius = '5px';
                messageElement.style.marginTop = '15px';
                messageElement.style.textAlign = 'center';
                messageElement.style.fontWeight = 'bold';
                messageElement.style.opacity = '0';
                messageElement.style.transition = 'opacity 0.3s';
                
                // Add to quiz container
                document.querySelector('.quiz').appendChild(messageElement);
            }
            
            // Set message text and show
            messageElement.textContent = text;
            setTimeout(() => messageElement.style.opacity = '1', 10);
            
            // Hide after 3 seconds
            setTimeout(() => {
                messageElement.style.opacity = '0';
                setTimeout(() => messageElement.remove(), 300);
            }, 3000);
        }
        
        // Function to update vote counts on UI
        function updateVoteCounts() {
            for (const sense in votes) {
                const element = document.querySelector(`.quiz-option[data-sense="${sense}"] .vote-count`);
                if (element) {
                    element.textContent = votes[sense];
                }
            }
        }
        
        // Function to update the stats bar
        function updateStatsBar() {
            const statsBar = document.querySelector('.stats-bar');
            statsBar.innerHTML = '';
            
            // Calculate total votes
            const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
            
            // Define colors for each sense
            const colors = {
                vision: '#3f51b5',  // Indigo
                hearing: '#009688', // Teal
                smell: '#ff9800',   // Orange
                taste: '#e91e63',   // Pink
                touch: '#4caf50'    // Green
            };
            
            // Only show stats bar if there are votes
            if (totalVotes > 0) {
                // Create segments for each sense
                for (const sense in votes) {
                    const percentage = (votes[sense] / totalVotes) * 100;
                    if (percentage > 0) {
                        const segment = document.createElement('div');
                        segment.className = 'stats-bar-segment';
                        segment.style.width = `${percentage}%`;
                        segment.style.backgroundColor = colors[sense];
                        segment.textContent = `${sense}: ${percentage.toFixed(1)}%`;
                        statsBar.appendChild(segment);
                    }
                }
            }
        }
        
        // Function to update the visual state of the quiz based on whether user has voted
        function updateQuizState() {
            const quizOptions = document.querySelectorAll('.quiz-option');
            
            if (hasVoted) {
                // Add a small visual indicator that quiz is complete
                quizOptions.forEach(option => {
                    // Make non-selected options slightly faded
                    if (!option.classList.contains('selected')) {
                        option.style.opacity = '0.7';
                    }
                    // Add a checkmark to the selected option
                    if (option.getAttribute('data-sense') === userSelection) {
                        const voteText = option.querySelector('span:first-child');
                        if (voteText && !voteText.textContent.includes('✓')) {
                            voteText.textContent = '✓ ' + voteText.textContent;
                        }
                    }
                });
            }
        }
        
        // Function to create confetti effect
        function createConfetti(element) {
            const sense = element.getAttribute('data-sense');
            const quiz = document.querySelector('.quiz');
            
            // Define emoji for each sense
            const emojis = {
                vision: '👁️',
                hearing: '👂',
                smell: '👃',
                taste: '👅',
                touch: '✋'
            };
            
            // Create 30 confetti pieces
            for (let i = 0; i < 30; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.textContent = emojis[sense];
                confetti.style.fontSize = `${Math.random() * 20 + 10}px`;
                confetti.style.left = `${Math.random() * 100}%`;
                
                // Set random animation duration and delay
                const duration = Math.random() * 3 + 2; // 2-5 seconds
                const delay = Math.random() * 0.5;
                
                confetti.style.animation = `fall ${duration}s ease-in ${delay}s forwards`;
                
                // Add to quiz container
                quiz.appendChild(confetti);
                
                // Remove after animation completes
                setTimeout(() => {
                    confetti.remove();
                }, (duration + delay) * 1000);
            }
        }
        
        // Add a reset button (for testing purposes)
        const statsContainer = document.querySelector('.stats-container');
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Your Vote';
        resetButton.style.marginTop = '15px';
        resetButton.style.padding = '8px 12px';
        resetButton.style.backgroundColor = '#f44336';
        resetButton.style.color = 'white';
        resetButton.style.border = 'none';
        resetButton.style.borderRadius = '4px';
        resetButton.style.cursor = 'pointer';
        resetButton.style.display = 'block';
        resetButton.style.marginLeft = 'auto';
        resetButton.style.marginRight = 'auto';
        
        resetButton.addEventListener('click', function() {
            if (hasVoted && userSelection) {
                // Decrement the vote count for this user's selection
                votes[userSelection]--;
                
                // Reset user's voting status
                localStorage.removeItem('sensoryQuizUserVoted');
                localStorage.removeItem('sensoryQuizUserSelection');
                hasVoted = false;
                userSelection = null;
                
                // Save updated votes
                localStorage.setItem('sensoryQuizVotes', JSON.stringify(votes));
                
                // Update UI
                document.querySelectorAll('.quiz-option').forEach(opt => {
                    opt.classList.remove('selected');
                    opt.style.opacity = '1';
                    const voteText = opt.querySelector('span:first-child');
                    if (voteText && voteText.textContent.includes('✓')) {
                        voteText.textContent = voteText.textContent.replace('✓ ', '');
                    }
                });
                
                updateVoteCounts();
                updateStatsBar();
                
                showMessage("Your vote has been reset. You can now vote again!");
            }
        });
        
        statsContainer.appendChild(resetButton);
        
        // Initialize UI
        updateVoteCounts();
        updateStatsBar();
