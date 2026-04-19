package com.smartcampus.backend;

import com.smartcampus.backend.dto.*;
import com.smartcampus.backend.model.Comment;
import com.smartcampus.backend.model.Ticket;
import com.smartcampus.backend.repository.TicketRepository;
import com.smartcampus.backend.service.TicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

//Unit tests for Module C - TicketService
@ExtendWith(MockitoExtension.class)
public class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @InjectMocks
    private TicketService ticketService;

    private Ticket mockTicket;
    private final String TICKET_ID = "ticket123";
    private final String USER_ID = "user123";
    private final String USER_NAME = "Test User";

    // This runs before each test to set up a fresh mock ticket
    @BeforeEach
    void setUp() {
        mockTicket = Ticket.builder()
                .id(TICKET_ID)
                .category("EQUIPMENT")
                .description("Projector is broken")
                .priority("HIGH")
                .status("OPEN")
                .contactDetails("077-1234567")
                .createdBy(USER_ID)
                .createdByName(USER_NAME)
                .attachments(new ArrayList<>())
                .comments(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    // =====================
    // TEST 1: Create Ticket
  
    @Test
    void createTicket_ShouldReturnTicketWithOpenStatus() {
        // ARRANGE - set up what we need
        TicketRequestDTO request = new TicketRequestDTO();
        request.setCategory("EQUIPMENT");
        request.setDescription("Projector is broken");
        request.setPriority("HIGH");
        request.setContactDetails("077-1234567");

        // Tell the mock repository: when save() is called, return mockTicket
        when(ticketRepository.save(any(Ticket.class))).thenReturn(mockTicket);

        // ACT - call the method we're testing
        TicketResponseDTO result = ticketService.createTicket(request, USER_ID, USER_NAME);

        // ASSERT - verify the results
        assertNotNull(result);
        assertEquals("OPEN", result.getStatus());
        assertEquals("EQUIPMENT", result.getCategory());
        assertEquals(USER_ID, result.getCreatedBy());

        // Verify that save() was called exactly once
        verify(ticketRepository, times(1)).save(any(Ticket.class));
    }

    // =====================
    // TEST 2: Get Ticket By ID - Success
    
    @Test
    void getTicketById_WhenTicketExists_ShouldReturnTicket() {
        // ARRANGE
        when(ticketRepository.findById(TICKET_ID)).thenReturn(Optional.of(mockTicket));

        // ACT
        TicketResponseDTO result = ticketService.getTicketById(TICKET_ID);

        // ASSERT
        assertNotNull(result);
        assertEquals(TICKET_ID, result.getId());
        assertEquals("OPEN", result.getStatus());
    }

    // =====================
    // TEST 3: Get Ticket By ID - Not Found
    
    @Test
    void getTicketById_WhenTicketNotFound_ShouldThrowException() {
        // ARRANGE
        when(ticketRepository.findById("wrongId")).thenReturn(Optional.empty());

        // ACT & ASSERT - expect a RuntimeException to be thrown
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            ticketService.getTicketById("wrongId");
        });

        assertTrue(exception.getMessage().contains("Ticket not found"));
    }

    // =====================
    // TEST 4: Valid Status Transition - OPEN to IN_PROGRESS
    
    @Test
    void updateTicketStatus_ValidTransition_ShouldUpdateStatus() {
        // ARRANGE
        TicketStatusUpdateDTO request = new TicketStatusUpdateDTO();
        request.setStatus("IN_PROGRESS");

        when(ticketRepository.findById(TICKET_ID)).thenReturn(Optional.of(mockTicket));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(mockTicket);

        // ACT
        ticketService.updateTicketStatus(TICKET_ID, request, USER_ID);

        // ASSERT - verify save was called (status was updated)
        verify(ticketRepository, times(1)).save(any(Ticket.class));
    }

    // =====================
    // TEST 5: Invalid Status Transition - OPEN to CLOSED

    @Test
    void updateTicketStatus_InvalidTransition_ShouldThrowException() {
        // ARRANGE
        TicketStatusUpdateDTO request = new TicketStatusUpdateDTO();
        request.setStatus("CLOSED"); // Can't go directly from OPEN to CLOSED

        when(ticketRepository.findById(TICKET_ID)).thenReturn(Optional.of(mockTicket));

        // ACT & ASSERT
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            ticketService.updateTicketStatus(TICKET_ID, request, USER_ID);
        });

        assertTrue(exception.getMessage().contains("Invalid status transition"));
    }

    // =====================
    // TEST 6: Add Comment
  
    @Test
    void addComment_ShouldAddCommentToTicket() {
        // ARRANGE
        CommentRequestDTO request = new CommentRequestDTO();
        request.setContent("This is a test comment");

        when(ticketRepository.findById(TICKET_ID)).thenReturn(Optional.of(mockTicket));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(mockTicket);

        // ACT
        TicketResponseDTO result = ticketService.addComment(TICKET_ID, request, USER_ID, USER_NAME);

        // ASSERT
        assertNotNull(result);
        verify(ticketRepository, times(1)).save(any(Ticket.class));
    }

    // =====================
    // TEST 7: Delete Comment - Owner can delete own comment
   
    @Test
    void deleteComment_WhenOwner_ShouldDeleteComment() {
        // ARRANGE - add a comment to the mock ticket
        Comment comment = Comment.builder()
                .id("comment123")
                .authorId(USER_ID)
                .authorName(USER_NAME)
                .content("Test comment")
                .createdAt(LocalDateTime.now())
                .build();
        mockTicket.getComments().add(comment);

        when(ticketRepository.findById(TICKET_ID)).thenReturn(Optional.of(mockTicket));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(mockTicket);

        // ACT
        ticketService.deleteComment(TICKET_ID, "comment123", USER_ID, false);

        // ASSERT
        verify(ticketRepository, times(1)).save(any(Ticket.class));
    }

    // =====================
    // TEST 8: Delete Comment - Non-owner cannot delete
   
    @Test
    void deleteComment_WhenNotOwner_ShouldThrowException() {
        // ARRANGE
        Comment comment = Comment.builder()
                .id("comment123")
                .authorId("anotherUser")
                .authorName("Another User")
                .content("Test comment")
                .createdAt(LocalDateTime.now())
                .build();
        mockTicket.getComments().add(comment);

        when(ticketRepository.findById(TICKET_ID)).thenReturn(Optional.of(mockTicket));

        // ACT & ASSERT
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            ticketService.deleteComment(TICKET_ID, "comment123", USER_ID, false);
        });

        assertTrue(exception.getMessage().contains("only delete your own"));
    }

    // =====================
    // TEST 9: Max Attachments Rule
    
    @Test
    void uploadAttachments_WhenExceedsMaxLimit_ShouldThrowException() {
        // ARRANGE - ticket already has 2 attachments, trying to add 2 more = exceeds limit
        mockTicket.getAttachments().add("image1.jpg");
        mockTicket.getAttachments().add("image2.jpg");
        mockTicket.setCreatedBy(USER_ID);

        when(ticketRepository.findById(TICKET_ID)).thenReturn(Optional.of(mockTicket));

        org.springframework.mock.web.MockMultipartFile file1 =
            new org.springframework.mock.web.MockMultipartFile("file1", "image1.jpg", "image/jpeg", new byte[0]);
        org.springframework.mock.web.MockMultipartFile file2 =
            new org.springframework.mock.web.MockMultipartFile("file2", "image2.jpg", "image/jpeg", new byte[0]);

        // ACT & ASSERT - 2 existing + 2 new = 4, exceeds limit of 3
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            ticketService.uploadAttachments(TICKET_ID, List.of(file1, file2), USER_ID);
        });

        assertTrue(exception.getMessage().contains("Maximum 3 attachments allowed"));
    }

    // =====================
    // TEST 10: Get My Tickets
    
    @Test
    void getMyTickets_ShouldReturnOnlyUserTickets() {
        // ARRANGE
        when(ticketRepository.findByCreatedBy(USER_ID)).thenReturn(List.of(mockTicket));

        // ACT
        List<TicketResponseDTO> result = ticketService.getMyTickets(USER_ID);

        // ASSERT
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(USER_ID, result.get(0).getCreatedBy());
    }
}